from flask import Flask, request, send_file, render_template, redirect, url_for,jsonify
from rembg import remove
from PIL import Image
import io
import os
import requests
from urllib.request import urlopen

app = Flask(__name__)

# Configuration
UPLOAD_FOLDER = './static/images/'
os.makedirs(UPLOAD_FOLDER, exist_ok=True)
app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER

# Add your Pexels API key here
PEXELS_API_KEY = 'lX3nisojas7OmJKQtQb5RqtD1UyQ33CzEs9srk6kdBNBWOJ5rswlGCNX'
PEXELS_API_URL = 'https://api.pexels.com/v1/search'

@app.route('/api/backgrounds')
def backgrounds_proxy():
    query = request.args.get('query', 'people')
    headers = {'Authorization': PEXELS_API_KEY}
    params = {'query': query, 'per_page': 15}

    response = requests.get(PEXELS_API_URL, headers=headers, params=params)
    if response.status_code == 200:
        data = response.json()
        photos = [p['src']['large'] for p in data['photos']]
        return jsonify({'images': photos})
    else:
        return jsonify({'error': 'Pexels API failed'}), response.status_code

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/remove-background', methods=['POST'])
def remove_background():
    if 'image' not in request.files:
        return 'No file part', 400

    file = request.files['image']
    if file.filename == '':
        return 'No selected file', 400

    try:
        input_image = file.read()
        output = remove(input_image)
        output_image = Image.open(io.BytesIO(output))

        output_path = os.path.join(app.config['UPLOAD_FOLDER'], 'output.png')
        output_image.save(output_path)

        return send_file(output_path, mimetype='image/png')

    except Exception as e:
        print("Error:", e)
        return f"Processing failed: {str(e)}", 500

if __name__ == '__main__':
    app.run(debug=True)
