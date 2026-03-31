from flask import Flask, request, jsonify, render_template
import qrcode

app = Flask(__name__)

queue = []
token_number = 1

@app.route('/')
def home():
    return render_template('index.html')

@app.route('/join')
def join_queue():
    global token_number

    token = f"T{token_number:03}"
    queue.append(token)

    position = len(queue)

    token_number += 1

    return jsonify({
        "message": f"Token {token} added",
        "position": position
    })

@app.route('/queue')
def view_queue():
    return jsonify(queue)

@app.route('/next')
def next_person():
    if len(queue) > 0:
        served = queue.pop(0)
        return jsonify({"served": served})
    else:
        return jsonify({"message": "Queue empty"})

@app.route('/qr/<name>')
def generate_qr(name):
    url = f"http://192.168.29.79:5000/join?name={name}"
    img = qrcode.make(url)
    img.save(f"{name}.png")
    return f"QR for {name} generated!"
if __name__ == '__main__':
    app.run(host='0.0.0.0', debug=True)