document
  .getElementById("registerForm")
  .addEventListener("submit", async (event) => {
    event.preventDefault(); // 폼 제출 방지

    // 모든 에러 메세지 초기화
    const errorElements = document.querySelectorAll(".error-text");
    errorElements.forEach((elem) => {
      elem.textContent = ""; // 초기화
      elem.classList.remove("show"); // 숨기기
    });

    // 폼 데이터 가져오기
    const formData = {
      username: document.querySelector(".username").value,
      emailAddr: document.querySelector(".emailAddr").value,
      password: document.querySelector(".password").value,
      password_confirm: document.querySelector(".password_confirm").value,
      nickname: document.querySelector(".nickname").value,
      phoneNumber: document.querySelector(".phoneNumber").value,
    };

    // 이메일 유효성 검사
    if (!formData.emailAddr.includes("@")) {
      const emailErrorElement = document.getElementById("emailAddrError");
      emailErrorElement.textContent = "@가 이메일 주소에 포함되어야 합니다.";
      emailErrorElement.classList.add("show");
      return; // 서버에 요청 보내지 않고 함수 종료
    }

    try {
      // 서버에 데이터 전송
      const response = await fetch("/login/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const result = await response.json();

      if (!result.success) {
        // 서버로부터 받은 오류 메세지 표시
        for (const [key, message] of Object.entries(result.errors)) {
          const errorElement = document.getElementById(`${key}Error`);
          if (errorElement) {
            errorElement.textContent = message;
            errorElement.classList.add("show");
          }
        }
      } else {
        // 회원가입 성공 시 모달 띄우기
        const modal = document.getElementById("successModal");
        modal.style.display = "flex"; // 모달을 표시

        // 사용자 이름을 모달에 표시
        const username = result.username; // 서버에서 받은 username
        document.querySelector(
          ".modal p"
        ).textContent = `${username}님, 회원가입을 축하드립니다!`;

        // "완료" 버튼 클릭 시 모달 닫기
        document.querySelector(".modalOffBt").addEventListener("click", () => {
          modal.style.display = "none";
        });
      }
    } catch (error) {
      console.error("Error", error);
    }
  });
