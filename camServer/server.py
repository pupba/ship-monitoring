from flask import Flask, request, jsonify
import numpy as np
import cv2
from modules.model import DetectModel
server = Flask(__name__)
# 선박 식별 모듈
dm = DetectModel()

cap = cv2.VideoCapture(0)


@server.route('/process', methods=['POST'])
def process_frame():
    nparr = np.frombuffer(request.data, np.uint8)
    img = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
    result = dm.detectVideo(img)
    print(result)
    # 처리 결과를 JSON 형태로 전송
    return jsonify(result), 200


if __name__ == '__main__':
    server.run(host='0.0.0.0', port=5050)
