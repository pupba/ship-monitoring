import torch
import cv2
import os
import numpy as np


class DetectModel:
    def __init__(self) -> None:
        self.__PATH = "./modules/weights/best.pt"
        # 모델 파일 있는지 확인
        if not os.path.isfile(self.__PATH):
            raise FileNotFoundError(
                f"'best.pt' 파일을 찾을 수 없습니다. 경로: {self.__PATH}")
        # GPU가 있다면 GPU 사용
        self.__device = torch.device(
            "cuda" if torch.cuda.is_available() else "cpu")
        self.__model = torch.hub.load(
            "ultralytics/yolov5", "custom", path=self.__PATH, force_reload=True)
        self.__model.to(self.__device)
        # img가 저장될 변수
        self.img: np.ndarray = None
        self.result = {"class": None, "ProcessingImg": None}
        self.__class = ("BigShip", "Boat", "Bridge", "Buoy", "Island")

    def detectVideo(self, frame) -> dict:
        self.img = frame
        result = self.__model(self.img)
        self.__makeBOX(result.pred[0])
        return self.result

    def __makeBOX(self, result: torch.Tensor) -> None:
        # 바운딩 박스 그리
        for det in result:
            label = int(det[5])  # 식별 클래스
            conf = float(det[4])  # 결과 신뢰도
            box = det[:4]

            if conf > 0.5:  # 신뢰도가 50% 이상인 것만 바운딩 박스 생성
                x1, y1, x2, y2 = map(int, box)  # 객체 식별 좌표

                # box 그리기
                COLOR = (0, 255, 0)
                cv2.rectangle(self.img, (x1, y1), (x2, y2), COLOR, 2)
                # 클래스 출력
                TEXT = f"{self.__class[label]}"
                cv2.putText(self.img, TEXT, (x1, y1-10),
                            cv2.FONT_HERSHEY_SIMPLEX, 0.5, COLOR, 2)

                # 결과를 저장
                self.result["class"] = self.__class[label]
                self.result["ProcessingImg"] = self.img

            else:  # 신뢰도가 낮음
                # 결과를 저장
                self.result["class"] = "None"
                self.result["ProcessingImg"] = "None"


if __name__ == "__main__":
    dm = DetectModel()
    for i in range(1, 11):
        img = cv2.imread(f"./test/test{i}.jpg")
        result = dm.detectVideo(img)
        if result["class"] != "None":
            cv2.imshow(f"{i}", result["ProcessingImg"])
            cv2.waitKey(0)
            cv2.destroyAllWindows()
