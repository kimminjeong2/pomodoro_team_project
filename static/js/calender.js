window.addEventListener("load", async () => {
  const today = new Date();
  const year = today.getFullYear();
  const month = today.getMonth() + 1;
  const date = today.getDate() - 1;
  const lastDay = new Date(year, month, 0).getDate();
  let currentIndex = 0;
  const firstDayOfMonth = new Date(
    today.getFullYear(),
    today.getMonth(),
    1
  ).getDay();
  const dayNames = ["일", "월", "화", "수", "목", "금", "토"];

  const plusDays = document.querySelector(".plusDays");
  const minusDays = document.querySelector(".minusDays");
  const plusmonth = document.querySelector(".plusmonth");
  const minusmonth = document.querySelector(".minusmonth");
  const monthSpan = document.querySelector("#month");
  const yearSpan = document.querySelector("#year");
  const dayList = document.querySelector(".dayList");
  const dayItem = document.querySelectorAll(`.dayList > li`);
  const addTodo = document.querySelector(".addTodo");
  const addList = document.querySelector(".addList");
  const addListClose = document.querySelector(".addListClose");
  const addListButton = document.querySelector(".addListButton");
  const todoform = document.forms["todoform"];
  const todoContainer = document.querySelector(".todo-container");
  window.addEventListener("resize", () => {
    if (dayList.style.transform) {
      dayList.style.transform = "";
    }
  });
  dayItem[date + 7 + firstDayOfMonth].classList.add("today");
  const div = document.createElement("div");
  Object.assign(div.style, {
    width: "7px",
    height: "7px",
    borderRadius: "50%",
    margin: "0 auto",
    backgroundColor: "black",
  });
  dayItem[date + 7 + firstDayOfMonth].appendChild(div);
  // if (window.innerWidth >= 768) {
  //   dayItem[date + 7 + firstDayOfMonth].classList.add("today");
  // } else {
  //   dayItem[date].classList.add("today");
  // }
  let currentMonth = +monthSpan.innerHTML.split("월").join("");
  let currentYear = +yearSpan.innerHTML.split("년").join("");
  let count = 4;
  // 첫 로딩시 현재 날짜로 이동
  for (let i = date; i >= 0; i--) {
    if (i % count === 0) {
      currentIndex = i;
      break;
    }
  }
  todayClick();
  deletebuttonActive();
  modifyButtonActive();
  statusChange();

  plusDays.addEventListener("click", () => {
    if (currentIndex >= lastDay - count) return;
    if (currentIndex >= 24 && currentMonth === 2) return;
    currentIndex += count;
    dayList.style.transform = `translateX(-${currentIndex * 20}vw)`;
  });

  minusDays.addEventListener("click", () => {
    if (currentIndex <= 0) return;
    currentIndex -= count;
    dayList.style.transform = `translateX(-${currentIndex * 20}vw)`;
  });

  plusmonth.addEventListener("click", async () => {
    if (currentMonth >= 12) {
      currentMonth = 1;
      monthSpan.innerHTML = `1월`;
      yearSpan.innerHTML = `${++currentYear}년`;
    } else {
      monthSpan.innerHTML = `${++currentMonth}월`;
    }

    const { data } = await axios({
      method: "GET",
      url: `calender/${currentMonth}/${currentYear}`,
    });

    dayList.innerHTML = "";

    for (let i = 0; i < 7; i++) {
      const li = document.createElement("li");
      li.innerHTML = dayNames[i];
      li.classList.add("daychar");
      dayList.appendChild(li);
    }

    for (let i = 0; i < data.firstDayOfMonth; i++) {
      const li = document.createElement("li");
      dayList.appendChild(li); // 각 날짜 추가
    }

    for (let day = 1; day <= data.lastDay; day++) {
      const li = document.createElement("li");
      const spanDay = document.createElement("span");
      const spanDate = document.createElement("span");
      spanDay.innerHTML = data.dayNames[(data.firstDayOfMonth + day - 1) % 7];
      spanDay.classList.add("day");
      spanDate.innerHTML = `${day}`;
      spanDate.classList.add("date");
      li.appendChild(spanDay);
      li.appendChild(spanDate);
      dayList.appendChild(li); // 각 날짜 추가
    }
    todayClick();
  });

  minusmonth.addEventListener("click", async () => {
    if (currentIndex >= 28 && currentMonth === 3) {
      currentIndex = currentIndex - count;
      dayList.style.transform = `translateX(-${currentIndex * 20}vw)`;
    }
    if (currentMonth <= 1) {
      currentMonth = 12;

      monthSpan.innerHTML = `12월`;
      yearSpan.innerHTML = `${--currentYear}년`;
    } else {
      monthSpan.innerHTML = `${--currentMonth}월`;
    }

    const { data } = await axios({
      method: "GET",
      url: `calender/${currentMonth}/${currentYear}`,
    });

    dayList.innerHTML = "";

    for (let i = 0; i < 7; i++) {
      const li = document.createElement("li");
      li.innerHTML = dayNames[i];
      li.classList.add("daychar");
      dayList.appendChild(li);
    }

    for (let i = 0; i < data.firstDayOfMonth; i++) {
      const li = document.createElement("li");
      dayList.appendChild(li); // 각 날짜 추가
    }
    for (let day = 1; day <= data.lastDay; day++) {
      const li = document.createElement("li");
      const spanDay = document.createElement("span");
      const spanDate = document.createElement("span");
      spanDay.innerHTML = data.dayNames[(data.firstDayOfMonth + day - 1) % 7];
      spanDay.classList.add("day");
      spanDate.innerHTML = `${day}`;
      spanDate.classList.add("date");
      li.appendChild(spanDay);
      li.appendChild(spanDate);
      dayList.appendChild(li); // 각 날짜 추가
    }
    todayClick();
  });

  function todayClick() {
    // 날짜 클릭시 today 클래스 적용
    const dayItem = document.querySelectorAll(`.dayList > li`);
    let today;
    dayItem.forEach((item) => {
      if (
        item.classList.contains("daychar") ||
        item.classList.contains("emptyBlock")
      )
        return;
      item.addEventListener("click", async (event) => {
        // 하나가 클릭되면 일단 모든 li의 today를 지움
        dayItem.forEach((day) => {
          day.classList.remove("today");
        });
        // 하나에게만 today를 추가한다.
        if (event.target.tagName === "SPAN") {
          const parentLi = event.target.parentElement;
          parentLi.classList.add("today");
          today = +parentLi.children[1].innerHTML;
        } else {
          event.target.classList.add("today");
          today = +event.target.children[1].innerHTML;
        }

        todoContainer.innerHTML = "";

        const { data } = await axios({
          method: "GET",
          url: "/calender/changeDate",
          params: {
            year: currentYear,
            month: currentMonth - 1,
            day: today,
          },
        });

        todoContainer.innerHTML = data;
        deletebuttonActive();
        modifyButtonActive();
        statusChange();
      });
    });
  }
  addTodo.addEventListener("click", () => {
    addList.style.display = "block";
    window.setTimeout(() => {
      addList.style.bottom = "0vh";
    }, 50);
    addTodo.style.display = "none";
  });
  addListClose.addEventListener("click", () => {
    closeTodoList();
  });
  addListButton.addEventListener("click", async () => {
    try {
      const title = todoform.title.value;
      const description = todoform.description.value;
      // 유효성 검사
      if (title === "" || description === "") {
        customAlert("주제와 세부내용을 모두 입력해주세요!", "warning");
        return;
      }
      const today = +document.querySelector(".today > .date").innerHTML;

      const { data } = await axios({
        method: "POST",
        url: "/calender/addTodo",
        data: {
          title: title,
          description: description,
          year: currentYear,
          month: currentMonth,
          today: today,
        },
      });
      const dataId = data.id;

      closeTodoList();
      // 요소 추가
      // 추가는 한번만 하면됨, 배열에 하나만 넣어서 추가 되도록 한다.
      const titles = [todoform.title.value];
      const descriptions = [todoform.description.value];
      const dataIds = [dataId];
      const response = await axios({
        method: "GET",
        url: "/get-component",
        params: {
          title: titles,
          description: descriptions,
          dataId: dataIds,
          state: ["pending"],
        },
      });
      // DOMParser 인스턴스 생성
      const parser = new DOMParser();
      // HTML 문자열을 Document로 파싱
      const doc = parser.parseFromString(response.data, "text/html");

      // HTML 요소 선택
      const element = doc.body.firstChild; // 첫 번째 요소 가져오기
      element.style.bottom = "-100vh";
      todoContainer.appendChild(element);
      window.setTimeout(() => {
        element.style.bottom = "0vh";
      }, 100);

      deletebuttonActive();
      modifyButtonActive();
      statusChange();
      customAlert("일정이 성공적으로 추가되었습니다.", "success");
      todoform.title.value = "";
      todoform.description.value = "";
    } catch (err) {
      console.error(err);
    }
  });

  function closeTodoList() {
    addList.style.bottom = "";
    window.setTimeout(() => {
      addList.style.display = "";
    }, 300);
    window.setTimeout(() => {
      addTodo.style.display = "block";
    }, 500);
  }

  function statusChange() {
    // 상태를 변화시켜서 DB에 업데이트한다.
    const statusButton = document.querySelectorAll(".state");
    let status = "pending";
    statusButton.forEach((item) => {
      if (!item.hasListener) {
        item.addEventListener("click", async (event) => {
          const dataId = event.target.parentElement.parentElement.dataset.id;
          if (event.target.classList.contains("pending")) {
            ClassStateChange(event.target, "pending", "done");
            status = "done";
          } else if (event.target.classList.contains("done")) {
            ClassStateChange(event.target, "done", "ongoing");
            status = "ongoing";
          } else if (event.target.classList.contains("ongoing")) {
            ClassStateChange(event.target, "ongoing", "pending");
            status = "pending";
          }

          const { data } = await axios({
            method: "PATCH",
            url: "/calender/status",
            data: {
              status: status,
              id: dataId,
            },
          });
        });
        item.hasListener = true; // 이벤트 리스너 등록 표시
      }
    });
  }
  function ClassStateChange(element, remove, add) {
    element.classList.remove(remove);
    element.classList.add(add);
  }
  function deletebuttonActive() {
    const deleteButton = document.querySelectorAll(".delete");
    deleteButton.forEach((item) => {
      item.addEventListener("click", async (event) => {
        const parentItem = event.target.parentElement.parentElement;
        const dataId = event.target.parentElement.parentElement.dataset.id;
        const { data } = await axios.delete("/calender/delete", {
          data: { dataId: dataId },
        });
        if (data) {
          parentItem.style.transform = "translateX(-100vw)";
          window.setTimeout(() => {
            parentItem.remove();
          }, 250);
        }
        customAlert("일정이 삭제되었습니다.", "success");
      });
    });
  }

  function modifyButtonActive() {
    const modifyButton = document.querySelectorAll(".modify");
    modifyButton.forEach((item) => {
      item.addEventListener("click", async (event) => {
        // 수정에 필요한 input 요소와 값 생성
        const {
          parentLi,
          textBox,
          form,
          input,
          textarea,
          inputValue,
          textareaValue,
        } = CreateElementTodoItem(event.target);

        // 실행 취소 버튼 생성
        let { button } = createCancleButton();
        let deleteButton = event.target.nextElementSibling;

        // 수정에 필요한 input 요소들 속성 설정
        settingTodoAttribute(form, input, textarea, inputValue, textareaValue);

        // 수정 진행
        if (event.target.classList.contains("modify")) {
          ChangeModifyButtonMode(event.target, "modify", "modifyCompliete");

          // 글자를 input으로 교체
          modifyed(
            parentLi,
            form,
            input,
            textarea,
            textBox,
            deleteButton,
            event.target,
            button
          );

          // 취소시 원상복귀
          button.addEventListener("click", async () => {
            rallbackTodo(
              inputValue,
              textareaValue,
              textBox,
              form,
              button,
              deleteButton,
              event.target
            );
          });
        } else {
          try {
            ChangeModifyButtonMode(event.target, "modifyCompliete", "modify");

            // 수정된 글자로 다시 돌리기
            const { itemform, titleValue, descriptionValue, dataId } =
              rollbackToCheracter(parentLi);

            const { data } = await axios({
              method: "PATCH",
              url: "/calender/modify",
              data: {
                title: titleValue,
                description: descriptionValue,
                dataId: dataId,
              },
            });
            // 취소 버튼 위치에 맞게 재 할당
            deleteButton = event.target.nextElementSibling.nextElementSibling;
            button = event.target.nextElementSibling;
            rallbackTodo(
              titleValue,
              descriptionValue,
              textBox,
              itemform,
              button,
              deleteButton,
              event.target
            );
            customAlert("수정이 완료되었습니다.", "success");
          } catch (error) {
            cuationError(error);
          }
        }
      });
    });
  }

  function rollbackToCheracter(parentLi) {
    const itemform = document.forms["itemform"];
    const titleValue = itemform.title.value;
    const descriptionValue = itemform.description.value;
    const dataId = parentLi.dataset.id;
    return {
      itemform,
      titleValue,
      descriptionValue,
      dataId,
    };
  }

  function ChangeModifyButtonMode(element, removeClass, addClass) {
    element.classList.remove(removeClass);
    element.classList.add(addClass);
  }

  function modifyed(
    parentLi,
    form,
    input,
    textarea,
    textBox,
    deleteButton,
    element,
    button
  ) {
    parentLi.querySelector("p") && parentLi.querySelector("p").remove();
    parentLi.querySelector("h3") && parentLi.querySelector("h3").remove();
    form.appendChild(input);
    form.appendChild(textarea);
    textBox.appendChild(form);

    // 삭제 버튼 > 수정 취소 버튼으로 교체
    deleteButton.style.display = "none";
    element.insertAdjacentElement("afterend", button);
  }

  function settingTodoAttribute(
    form,
    input,
    textarea,
    inputValue,
    textareaValue
  ) {
    form.name = "itemform";
    input.type = "text";
    input.name = "title";
    input.placeholder = "수정할 제목을 입력해 주세요";
    input.value = inputValue;
    input.classList = "modifyInput";
    textarea.type = "text";
    textarea.name = "description";
    textarea.placeholder = "수정할 내용을 입력해 주세요";
    textarea.value = textareaValue.replaceAll("<br>", " ");
    textarea.classList.add("modifyTextarea");
  }

  function createCancleButton() {
    let button = document.createElement("button");
    button.type = "button";
    button.classList.add("imgButton");
    button.classList.add("cancle");
    return { button };
  }

  function CreateElementTodoItem(element) {
    const parentLi = element.parentElement.parentElement;
    const textBox = parentLi.querySelector("div > div > div");
    const form = document.createElement("form");
    const input = document.createElement("input");
    const textarea = document.createElement("textarea");
    const inputValue = parentLi.querySelector("h3")
      ? parentLi.querySelector("h3").innerHTML
      : "";
    const textareaValue = parentLi.querySelector("p")
      ? parentLi.querySelector("p").innerHTML
      : "";

    return {
      parentLi,
      textBox,
      form,
      input,
      textarea,
      inputValue,
      textareaValue,
    };
  }

  function rallbackTodo(
    inputValue,
    textareaValue,
    textBox,
    form,
    button,
    deleteButton,
    element
  ) {
    const h3 = document.createElement("h3");
    const p = document.createElement("p");
    h3.innerHTML = inputValue;
    p.innerHTML = textareaValue.replaceAll(/\n/g, "<br>");
    form.remove();
    textBox.appendChild(h3);
    textBox.appendChild(p);
    button.remove();
    deleteButton.style.display = "block";
    ChangeModifyButtonMode(element, "modifyCompliete", "modify");
  }

  function cuationError(error) {
    console.error(error);
    console.error("수정 요청 실패:", error);
    if (error.response) {
      console.error("서버 오류:", error.response.data);
    }
  }
  function customAlert(ment, state) {
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
});
