import cv2
import requests

# 웹캠 열기
cap = cv2.VideoCapture(0)

while True:
    # 프레임 읽기
    ret, frame = cap.read()

    if not ret:
        break

    # 이미지를 .jpg 형식의 바이너리 데이터로 인코딩하기 위해 imencode 함수 사용
    _, img_encoded = cv2.imencode('.jpg', frame)

    # Flask 서버로 POST 요청 보내기 (여기서 'http://localhost:5000'은 예시이며 실제 서버 주소로 변경해야 함)
    response = requests.post(
        'http://localhost:5050/process', data=img_encoded.tostring(), headers={'content-type': 'image/jpeg'})
    print(response)
# 메모리 해제 및 창 닫기
cap.release()
cv2.destroyAllWindows()
