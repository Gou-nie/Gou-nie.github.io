# server.py
from flask import Flask, request, jsonify
from flask_cors import CORS
import aiDeepSeek
app = Flask(__name__)
CORS(app, resources={r"/*": {"origins": "*"}}) 

@app.route('/')
def index():
    return jsonify(message="服务已启动，端口：9898")


@app.route('/aaa', methods=['POST', 'GET'])
def aaa():
    params = request.get_json()
    print("@@@@ 参数:", params)  # 打印所有GET参数
    res = aiDeepSeek.chat_with_deepseek(params['prompt'])
    return res


if __name__ == '__main__':
    app.run(host='0.0.0.0', port=9898)
