import base64
import json
import os
import sqlite3
import requests
import re
from flask import Flask, jsonify, render_template, request, send_from_directory


IGDB_CLIENT_ID = os.environ.get("IGDB_CLIENT_ID", "YOUR_CLIENT_ID")
IGDB_CLIENT_SECRET = os.environ.get("IGDB_CLIENT_SECRET", "YOUR_CLIENT_SECRET")

_cached_token = None

def get_igdb_token():
    """Fetches or reuses an App Access Token from Twitch OAuth."""
    global _cached_token
    if _cached_token:
        return _cached_token

    auth_url = "https://id.twitch.tv/oauth2/token"
    params = {
        "client_id": IGDB_CLIENT_ID,
        "client_secret": IGDB_CLIENT_SECRET,
        "grant_type": "client_credentials"
    }
    res = requests.post(auth_url, params=params)
    if res.ok:
        _cached_token = res.json().get("access_token")
        return _cached_token
    return None

def fetch_igdb_cover(game_title, platform=None):
    token = get_igdb_token()
    if not token:
        return None

    headers = {
        "Client-ID": IGDB_CLIENT_ID,
        "Authorization": f"Bearer {token}",
    }

    body = f'search "{game_title}"; fields name,cover.image_id,platforms.name; limit 5;'

    try:
        response = requests.post("https://api.igdb.com/v4/games", headers=headers, data=body)
        if response.ok:
            data = response.json()
            for game in data:
                if "cover" in game and "image_id" in game["cover"]:
                    image_id = game["cover"]["image_id"]
                    return f"https://images.igdb.com/igdb/image/upload/t_cover_big/{image_id}.jpg"
    except Exception as e:
        print(f"IGDB Fetch Error: {e}")

    return "https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=300"

try:
  from google import genai
  from google.genai import types

  HAS_GENAI_SDK = True
except ImportError:
  HAS_GENAI_SDK = False

app = Flask(__name__)
DB_NAME = "collector.db"


def get_gemini_client():
  """Dynamically initializes and returns the Gemini client on demand."""
  if not HAS_GENAI_SDK:
    return None

  api_key = os.environ.get("GEMINI_API_KEY", "").strip()
  if not api_key:
    return None

  try:
    return genai.Client(api_key=api_key)
  except Exception as e:
    print(f"Warning: Failed to initialize Gemini Client: {e}")
    return None

def extract_error_code(exception_obj):
    """Extracts a numeric status code or error code from an exception string."""
    err_str = str(exception_obj)
    # Look for standard HTTP status codes (4xx or 5xx)
    match = re.search(r'\b(4\d{2}|5\d{2})\b', err_str)
    if match:
        return match.group(1)
    # Look for any explicit error code number patterns
    match_num = re.search(r'(?:code|status|err)[^\w]*(\d+)', err_str, re.IGNORECASE)
    if match_num:
        return match_num.group(1)
    return "500"

def init_db():
  """Initializes the SQLite database and creates necessary tables."""
  conn = sqlite3.connect(DB_NAME)
  cursor = conn.cursor()

  cursor.execute("""
        CREATE TABLE IF NOT EXISTS users (
            username TEXT PRIMARY KEY,
            password TEXT NOT NULL
        )
    """)

  cursor.execute("""
        CREATE TABLE IF NOT EXISTS collection (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            username TEXT,
            game_id TEXT,
            title TEXT,
            system TEXT,
            year TEXT,
            publisher TEXT,
            release_date TEXT,
            avg_price TEXT,
            condition TEXT,
            cover_image TEXT,
            date_added TEXT,
            region TEXT,
            FOREIGN KEY(username) REFERENCES users(username)
        )
    """)

  # Ensure region column exists if table was created previously
  try:
    cursor.execute("ALTER TABLE collection ADD COLUMN region TEXT;")
  except sqlite3.OperationalError:
    pass

  cursor.execute("""
        CREATE TABLE IF NOT EXISTS wishlist (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            username TEXT,
            game_id TEXT,
            title TEXT,
            system TEXT,
            year TEXT,
            cover_image TEXT,
            FOREIGN KEY(username) REFERENCES users(username)
        )
    """)

  conn.commit()
  conn.close()


init_db()


@app.route("/api/scan", methods=["POST"])
def scan_game_ai():
  """Scans game cover image with Gemini and fetches real cover art from IGDB."""
  req_data = request.json or {}
  image_data_uri = req_data.get("image_base64", "")

  if not image_data_uri:
    return jsonify({"status": "error", "message": "No image provided"}), 400

  client = get_gemini_client()
  if not client:
    return jsonify({"status": "error", "message": "Gemini API key is missing."}), 500

  try:
    header, encoded = image_data_uri.split(",", 1)
    image_bytes = base64.b64decode(encoded)
    mime_type = "image/jpeg"
    if "image/png" in header:
      mime_type = "image/png"

    prompt = """
        Analyze this image. First, determine if this image is a video game box art, cartridge, disc case, or related video game packaging (there may be more than one).
        If the image is NOT a video game (e.g. shoes, animals, food, random objects, unrelated items), you must return a JSON object with a single key:
        - "error": "This does not appear to be a video game box art."

        If it IS a video game (or multiple), return a JSON object with:
        - "title": (string, exact full video game title)
        - "system": (string, gaming platform/console e.g. PS2, SNES, Switch)
        - "publisher": (string, publisher name if visible)
        - "releaseDate": (string, release year or date)
        - "avgPrice": (string, estimated collector market value formatted like "$XX.YY")
        - "condition": (string, either "Loose" or "Complete in Box (CIB)")
        - "region": (string, game release region e.g. "NTSC-U (North America)", "NTSC-J (Japan)", "PAL (Europe)", "Region Free")
        - "confidence": (integer 0 to 99 accuracy score)

        Do not wrap in markdown codeblocks. Return valid raw JSON array only.
        """

    response = client.models.generate_content(
        model="gemini-3.5-flash-lite",
        contents=[
            types.Part.from_bytes(data=image_bytes, mime_type=mime_type),
            prompt,
        ],
        config=types.GenerateContentConfig(response_mime_type="application/json"),
    )

    parsed_response = json.loads(response.text)

    if isinstance(parsed_response, dict) and "error" in parsed_response:
      return jsonify({"status": "error", "message": parsed_response["error"]}), 400

    games_data = parsed_response if isinstance(parsed_response, list) else [parsed_response]

    for game_data in games_data:
      game_title = game_data.get("title")
      if game_title:
        igdb_cover = fetch_igdb_cover(game_title)
        if igdb_cover:
          game_data["coverImage"] = igdb_cover

    return jsonify({"status": "success", "games": games_data, "game": games_data[0] if games_data else None})

  except Exception as e:
    print(f"Scan Error: {e}")
    code = extract_error_code(e)
    return jsonify({"status": "error", "message": f"Gemini has encountered an error: {code}"}), 500


@app.route("/api/recommend", methods=["POST"])
def get_recommendations_ai():
  """Uses Gemini to generate recommendations and fetches real covers from IGDB."""
  req_data = request.json or {}
  user_instructions = req_data.get("instructions", "").strip()

  if not user_instructions:
    return jsonify({"status": "error", "message": "Instructions are required"}), 400

  client = get_gemini_client()
  if not client:
    return jsonify({"status": "error", "message": "Gemini API key is missing."}), 500

  try:
    prompt = f"""
        The user is looking for video game recommendations based on this prompt:
        "{user_instructions}"

        Provide 3 specific video game recommendations.
        Return ONLY a JSON array of objects where each object has:
        - "title": (string, full video game name)
        - "system": (string, primary gaming platform)
        - "confidence": (integer 0 to 99 representing recommendation accuracy score)
        - "reason": (string, 1-2 sentence explanation of why this fits their prompt)

        Do not wrap in markdown codeblocks. Return valid raw JSON array only.
        """

    response = client.models.generate_content(
        model="gemini-3.5-flash-lite",
        contents=prompt,
        config=types.GenerateContentConfig(response_mime_type="application/json"),
    )

    recs = json.loads(response.text)

    for game in recs:
      igdb_cover = fetch_igdb_cover(game["title"])
      if igdb_cover:
        game["coverImage"] = igdb_cover

    return jsonify({"status": "success", "recommendations": recs, "source": "gemini"})

  except Exception as e:
    print(f"Recommendations Error: {e}")
    code = extract_error_code(e)
    return jsonify({"status": "error", "message": f"Gemini has encountered an error: {code}"}), 500


@app.route("/api/signup", methods=["POST"])
def signup():
  req_data = request.json or {}
  username = req_data.get("username", "").strip().lower()
  password = req_data.get("password", "")

  if not username or not password:
    return jsonify({"error": "Username and password required"}), 400

  conn = sqlite3.connect(DB_NAME)
  cursor = conn.cursor()
  try:
    cursor.execute(
        "INSERT INTO users (username, password) VALUES (?, ?)",
        (username, password),
    )
    conn.commit()
    return jsonify({"status": "success", "username": username})
  except sqlite3.IntegrityError:
    return jsonify({"error": "Username already exists"}), 400
  finally:
    conn.close()


@app.route("/api/login", methods=["POST"])
def login():
  req_data = request.json or {}
  username = req_data.get("username", "").strip().lower()
  password = req_data.get("password", "")

  conn = sqlite3.connect(DB_NAME)
  cursor = conn.cursor()
  cursor.execute("SELECT password FROM users WHERE username = ?", (username,))
  row = cursor.fetchone()
  conn.close()

  if row and row[0] == password:
    return jsonify({"status": "success", "username": username})
  else:
    return jsonify({"error": "Invalid username or password"}), 401


@app.route("/api/user/<username>", methods=["GET", "POST"])
def handle_user_data(username):
  conn = sqlite3.connect(DB_NAME)
  cursor = conn.cursor()

  if request.method == "POST":
    req_data = request.json or {}
    collection = req_data.get("collection", [])
    wishlist = req_data.get("wishlist", [])

    cursor.execute("DELETE FROM collection WHERE username = ?", (username,))
    cursor.execute("DELETE FROM wishlist WHERE username = ?", (username,))

    for item in collection:
      cursor.execute(
          """
                INSERT INTO collection (username, game_id, title, system, year, publisher, release_date, avg_price, condition, cover_image, date_added, region)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            """,
          (
              username,
              item.get("id"),
              item.get("title"),
              item.get("system"),
              item.get("year"),
              item.get("publisher"),
              item.get("releaseDate"),
              item.get("avgPrice"),
              item.get("condition"),
              item.get("coverImage"),
              item.get("dateAdded"),
              item.get("region"),
          ),
      )

    for item in wishlist:
      cursor.execute(
          """
                INSERT INTO wishlist (username, game_id, title, system, year, cover_image)
                VALUES (?, ?, ?, ?, ?, ?)
            """,
          (
              username,
              item.get("id"),
              item.get("title"),
              item.get("system"),
              item.get("year"),
              item.get("coverImage"),
          ),
      )

    conn.commit()
    conn.close()
    return jsonify({"status": "success"})
  else:
    cursor.execute(
        "SELECT game_id, title, system, year, publisher, release_date,"
        " avg_price, condition, cover_image, date_added, region FROM collection WHERE"
        " username = ?",
        (username,),
    )
    col_rows = cursor.fetchall()
    collection = [
        {
            "id": r[0],
            "title": r[1],
            "system": r[2],
            "year": r[3],
            "publisher": r[4],
            "releaseDate": r[5],
            "avgPrice": r[6],
            "condition": r[7],
            "coverImage": r[8],
            "dateAdded": r[9],
            "region": r[10],
        }
        for r in col_rows
    ]

    cursor.execute(
        "SELECT game_id, title, system, year, cover_image FROM wishlist WHERE"
        " username = ?",
        (username,),
    )
    wish_rows = cursor.fetchall()
    wishlist = [
        {
            "id": r[0],
            "title": r[1],
            "system": r[2],
            "year": r[3],
            "coverImage": r[4],
        }
        for r in wish_rows
    ]

    conn.close()
    return jsonify({"collection": collection, "wishlist": wishlist})


@app.route("/logo.png")
def serve_logo():
    return send_from_directory("templates", "logo.png")


@app.route("/")
def index():
  return render_template("index.html")


if __name__ == "__main__":
  app.run(debug=True, port=5000)