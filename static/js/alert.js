export function customAlert(ment, state) {
  // 모달 창 요소 생성
  let divElement = document.createElement("div");
  divElement.classList.add("cumtomAlert"); // 클래스 추가

  // ------------------------------------------------
  // 주의 SVG 아이콘 생성
  let warningsvgElement = document.createElementNS(
    "http://www.w3.org/2000/svg",
    "svg"
  );
  warningsvgElement.setAttribute("xmlns", "http://www.w3.org/2000/svg");
  warningsvgElement.classList.add("bi", "bi-exclamation-circle", "warning");
  warningsvgElement.setAttribute("viewBox", "0 0 16 16");

  let pathElement1 = document.createElementNS(
    "http://www.w3.org/2000/svg",
    "path"
  );
  pathElement1.setAttribute(
    "d",
    "M8 15A7 7 0 1 1 8 1a7 7 0 0 1 0 14m0 1A8 8 0 1 0 8 0a8 8 0 0 0 0 16"
  );

  let pathElement2 = document.createElementNS(
    "http://www.w3.org/2000/svg",
    "path"
  );
  pathElement2.setAttribute(
    "d",
    "M7.002 11a1 1 0 1 1 2 0 1 1 0 0 1-2 0M7.1 4.995a.905.905 0 1 1 1.8 0l-.35 3.507a.552.552 0 0 1-1.1 0z"
  );

  warningsvgElement.appendChild(pathElement1);
  warningsvgElement.appendChild(pathElement2);
  // ------------------------------------------------

  // ------------------------------------------------
  // 성공 SVG 아이콘 생성
  let checksvgElement = document.createElementNS(
    "http://www.w3.org/2000/svg",
    "svg"
  );
  checksvgElement.setAttribute("xmlns", "http://www.w3.org/2000/svg");
  checksvgElement.classList.add("bi", "bi-check-circle", "success");
  checksvgElement.setAttribute("viewBox", "0 0 16 16");

  let checkpathElement = document.createElementNS(
    "http://www.w3.org/2000/svg",
    "path"
  );
  checkpathElement.setAttribute(
    "d",
    "M8 15A7 7 0 1 1 8 1a7 7 0 0 1 0 14m0 1A8 8 0 1 0 8 0a8 8 0 0 0 0 16"
  );

  let checkpathElement2 = document.createElementNS(
    "http://www.w3.org/2000/svg",
    "path"
  );
  checkpathElement2.setAttribute(
    "d",
    "m10.97 4.97-.02.022-3.473 4.425-2.093-2.094a.75.75 0 0 0-1.06 1.06L6.97 11.03a.75.75 0 0 0 1.079-.02l3.992-4.99a.75.75 0 0 0-1.071-1.05"
  );

  checksvgElement.appendChild(checkpathElement);
  checksvgElement.appendChild(checkpathElement2);
  // ------------------------------------------------

  // 두 번째 div 요소 생성
  let divElement2 = document.createElement("div");
  let h1Element = document.createElement("h1");
  state === "warning"
    ? (h1Element.innerHTML = `Alert Message`)
    : (h1Element.innerHTML = `Success Message`);

  let pElement = document.createElement("p");
  pElement.innerHTML = `${ment}`; // 직접 텍스트 추가

  divElement2.appendChild(h1Element);
  divElement2.appendChild(pElement);

  // ------------------------------------------------
  // 닫기 버튼 및 SVG 아이콘 생성
  let buttonElement = document.createElement("button");
  buttonElement.classList.add("closeButton");

  let svgElement2 = document.createElementNS(
    "http://www.w3.org/2000/svg",
    "svg"
  );
  svgElement2.setAttribute("xmlns", "http://www.w3.org/2000/svg");
  svgElement2.classList.add("bi", "bi-x");
  svgElement2.setAttribute("viewBox", "0 0 16 16");

  let pathElement3 = document.createElementNS(
    "http://www.w3.org/2000/svg",
    "path"
  );
  pathElement3.setAttribute(
    "d",
    "M4.646 4.646a.5.5 0 0 1 .708 0L8 7.293l2.646-2.647a.5.5 0 0 1 .708.708L8.707 8l2.647 2.646a.5.5 0 0 1-.708.708L8 8.707l-2.646 2.647a.5.5 0 0 1-.708-.708L7.293 8 4.646 5.354a.5.5 0 0 1 0-.708"
  );

  svgElement2.appendChild(pathElement3);
  buttonElement.appendChild(svgElement2);

  // ------------------------------------------------
  // 모든 요소를 모달 창에 추가
  state === "warning"
    ? divElement.appendChild(warningsvgElement)
    : divElement.appendChild(checksvgElement);
  divElement.appendChild(divElement2);
  divElement.appendChild(buttonElement);

  // 모달 창을 문서의 body에 추가
  document.body.appendChild(divElement);

  divElement.classList.add("animated");

  setTimeout(() => {
    divElement.classList.remove("animated");

    setTimeout(() => {
      document.body.removeChild(divElement);
    }, 500);
  }, 2000);

  buttonElement.addEventListener("click", function () {
    divElement.classList.remove("animated");
  });
}
