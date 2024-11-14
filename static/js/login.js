// 모달 띄우는 함수
function openModal(message) {
  const modal = document.getElementById("loginErrorModal");
  const modalMessage = modal.querySelector(".modal-message");
  modalMessage.textContent = message; // 오류 메세지 설정
  modal.classList.add("show");
}

// 모달 닫는 함수
function closeModal() {
  const modal = document.getElementById("loginErrorModal");
  modal.classList.remove("show");
}

// 로그인 요청 함수
async function loginUser() {
  const emailAddr = document.querySelector(".emailAddr").value;
  const password = document.querySelector(".password").value;

  try {
    const response = await fetch("/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ emailAddr, password }),
    });

    const data = await response.json();
    if (response.status === 200 && data.success) {
      // 로그인 성공 시 페이지 리디렉션
      window.location.href = "/"; // 로그인 성공 후 홈으로 이동
    } else {
      // 로그인 실패 시 modal 띄우기
      openModal(data.message);
    }
  } catch (error) {
    console.error("Error logging in", error);
    openModal("서버 오류가 발생했습니다.");
  }
}
