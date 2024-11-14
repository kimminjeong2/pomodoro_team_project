// 모달 열기 및 닫기 함수
function openModal(message) {
  document.getElementById("modalMessage").textContent = message;
  document.getElementById("resultModal").style.display = "flex";
}

function closeModal() {
  document.getElementById("resultModal").style.display = "none";
}

function userFoundModal(message) {
  document.getElementById("userFoundModalMessage").textContent = message;
  document.getElementById("userFoundModal").style.display = "flex";
}

function closeUserFoundModal() {
  document.getElementById("userFoundModal").style.display = "none";
}

function openResetModal() {
  document.getElementById("resetPasswordModal").style.display = "flex";
}

function closeResetModal() {
  document.getElementById("resetPasswordModal").style.display = "none";
}

function openErrorModal(message) {
  document.getElementById("errorMessage").textContent = message;
  document.getElementById("errorModal").style.display = "flex";
}

function closeErrorModal() {
  document.getElementById("errorModal").style.display = "none";
}

async function findEmail() {
  const username = document.querySelector(".usernameId").value;
  const phoneNumber = document.querySelector(".phoneNumberId").value;

  // 에러 메세지 초기화
  const usernameIdErrorEl = document.getElementById("usernameIdError");
  const phoneNumberIdErrorEl = document.getElementById("phoneNumberIdError");

  // 초기화 작업: 에러 메세지 지우기
  if (usernameIdErrorEl) {
    usernameIdErrorEl.classList.remove("show");
    usernameIdErrorEl.textContent = ""; // 텍스트 초기화
  }
  if (phoneNumberIdErrorEl) {
    phoneNumberIdErrorEl.classList.remove("show");
    phoneNumberIdErrorEl.textContent = ""; // 텍스트 초기화
  }

  try {
    const response = await fetch("/login/find/email", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ username, phoneNumber }),
    });

    const data = await response.json();

    if (response.status === 200) {
      // 이메일이 확인되면 모달을 띄우고 이메일 주소를 표시
      openModal(`이메일 주소: ${data.emailAddr}`);
    } else if (response.status === 404) {
      // 오류 데이터에 따른 처리
      if (data.error === "username") {
        // 사용자 이름이 틀린 경우
        usernameIdErrorEl.classList.add("show"); // 'show' 클래스 추가
        usernameIdErrorEl.textContent = "해당되는 이름이 없습니다.";
      }
      if (data.error === "phoneNumber") {
        // 전화번호가 틀린 경우
        phoneNumberIdErrorEl.classList.add("show"); // 'show' 클래스 추가
        phoneNumberIdErrorEl.textContent = "해당되는 휴대전화 번호가 없습니다.";
      }

      // 이름과 전화번호 모두 틀렸을 때는 둘 다 표시
      else if (data.error === "mismatch") {
        if (usernameIdErrorEl) {
          usernameIdErrorEl.classList.add("show"); // 'show' 클래스 추가
          usernameIdErrorEl.textContent = "해당되는 이름이 없습니다.";
        }
        if (phoneNumberIdErrorEl) {
          phoneNumberIdErrorEl.classList.add("show"); // 'show' 클래스 추가
          phoneNumberIdErrorEl.textContent =
            "해당되는 휴대전화 번호가 없습니다.";
        }
      }
    }
  } catch (error) {
    console.error("Error finding email:", error);
    // 서버 오류가 발생한 경우만 모달 창을 띄움
    openModal("서버 오류가 발생했습니다.");
  }
}

// 사용자 확인 및 비밀번호 재설정 할 Javascript

let userId; // 사용자 ID를 저장할 변수

// 비밀번호 재설정 요청 함수
async function requestPasswordReset() {
  const username = document.querySelector(".usernamePw").value;
  const phoneNumber = document.querySelector(".phoneNumberPw").value;
  const emailAddr = document.querySelector(".emailAddrPw").value;

  // 에러 메세지 초기화
  const usernamePwErrorEl = document.getElementById("usernamePwError");
  const phoneNumberPwErrorEl = document.getElementById("phoneNumberPwError");
  const emailAddrPwErrorEl = document.getElementById("emailAddrPwError");

  // 초기화 작업: 에러 메세지 지우기
  if (usernamePwErrorEl) {
    usernamePwErrorEl.classList.remove("show");
    usernamePwErrorEl.textContent = ""; // 텍스트 초기화
  }
  if (phoneNumberPwErrorEl) {
    phoneNumberPwErrorEl.classList.remove("show");
    phoneNumberPwErrorEl.textContent = ""; // 텍스트 초기화
  }
  if (emailAddrPwErrorEl) {
    emailAddrPwErrorEl.classList.remove("show");
    emailAddrPwErrorEl.textContent = ""; // 텍스트 초기화
  }

  try {
    const response = await fetch("/login/find/password", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ username, phoneNumber, emailAddr }),
    });

    const data = await response.json();

    if (response.status === 200) {
      // 사용자가 있을 경우, 사용자 ID를 받아오고 재설정 모달을 띄움
      userId = data.userId; // 서버에서 받은 userId 저장
      openResetModal();
    } else if (response.status === 404) {
      // 오류 데이터에 따른 처리
      if (data.error === "username") {
        // 사용자 이름만 틀린 경우
        usernamePwErrorEl.classList.add("show"); // 'show' 클래스 추가
        usernamePwErrorEl.textContent = "해당되는 이름이 없습니다.";
      }
      if (data.error === "phoneNumber") {
        // 전화번호가 틀린 경우
        phoneNumberPwErrorEl.classList.add("show"); // 'show' 클래스 추가
        phoneNumberPwErrorEl.textContent = "해당되는 휴대전화 번호가 없습니다.";
      }
      if (data.error === "emailAddr") {
        // 이메일이 틀린 경우
        emailAddrPwErrorEl.classList.add("show"); // 'show' 클래스 추가
        emailAddrPwErrorEl.textContent = "해당되는 이메일이 없습니다.";
      } else if (data.error === "username & phoneNumber") {
        // 이름, 전화번호 틀린 경우
        usernamePwErrorEl.classList.add("show"); // 'show' 클래스 추가
        usernamePwErrorEl.textContent = "해당되는 이름이 없습니다.";
        phoneNumberPwErrorEl.classList.add("show"); // 'show' 클래스 추가
        phoneNumberPwErrorEl.textContent = "해당되는 휴대전화 번호가 없습니다.";
      } else if (data.error === "username & emailAddr") {
        usernamePwErrorEl.classList.add("show"); // 'show' 클래스 추가
        usernamePwErrorEl.textContent = "해당되는 이름이 없습니다.";
        emailAddrPwErrorEl.classList.add("show"); // 'show' 클래스 추가
        emailAddrPwErrorEl.textContent = "해당되는 이메일이 없습니다.";
      } else if (data.error === "phoneNumber & emailAddr") {
        phoneNumberPwErrorEl.classList.add("show"); // 'show' 클래스 추가
        phoneNumberPwErrorEl.textContent = "해당되는 휴대전화 번호가 없습니다.";
        emailAddrPwErrorEl.classList.add("show"); // 'show' 클래스 추가
        emailAddrPwErrorEl.textContent = "해당되는 이메일이 없습니다.";
      }

      // 이름과 전화번호 모두 틀렸을 때는 둘 다 표시
      else if (data.error === "mismatch") {
        if (usernamePwErrorEl) {
          usernamePwErrorEl.classList.add("show"); // 'show' 클래스 추가
          usernamePwErrorEl.textContent = "해당되는 이름이 없습니다.";
        }
        if (phoneNumberPwErrorEl) {
          phoneNumberPwErrorEl.classList.add("show"); // 'show' 클래스 추가
          phoneNumberPwErrorEl.textContent =
            "해당되는 휴대전화 번호가 없습니다.";
        }
        if (emailAddrPwErrorEl) {
          emailAddrPwErrorEl.classList.add("show"); // 'show' 클래스 추가
          emailAddrPwErrorEl.textContent = "해당되는 이메일이 없습니다.";
          emailAddrPwErrorEl.classList.add("show"); // 'show' 클래스 추가
          emailAddrPwErrorEl.textContent = "해당되는 이메일이 없습니다.";
        }
      }
    } else {
      // 그 외의 오류 처리
      openErrorModal("서버에서 예상치 못한 오류가 발생했습니다.");
    }
  } catch (error) {
    console.error("Error requesting password reset", error);
    openErrorModal("서버 오류가 발생했습니다.");
  }
}

// 비밀번호 업데이트 함수
async function updatePassword() {
  const newPassword = document.getElementById("newPassword").value;
  const confirmPassword = document.getElementById("confirmPassword").value;

  // 비밀번호 일치 확인
  if (newPassword !== confirmPassword) {
    openErrorModal("비밀번호가 일치하지 않습니다.");
    return;
  }

  if (!newPassword || !confirmPassword) {
    openErrorModal("비밀번호를 입력해 주세요.");
    return;
  }

  try {
    const response = await fetch("/login/find/update", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ userId, newPassword }),
    });

    const data = await response.json();

    if (response.status === 200) {
      openErrorModal(data.message); // 비밀번호 변경 성공 메세지
      closeResetModal(); // 모달창 닫기
    } else {
      openErrorModal(data.message || "비밀번호 변경에 실패했습니다.");
    }
  } catch (error) {
    console.error("Error updating password:", error);
    openErrorModal("서버 오류가 발생했습니다.");
  }
}

// 비밀번호 재설정버튼 누르면 input 비우기

$(".modalBt").click(function () {
  $("#newPassword").val("");
  $("#confirmPassword").val("");
});

$(".modalOffBt").click(function () {
  $("#newPassword").val("");
  $("#confirmPassword").val("");
});
