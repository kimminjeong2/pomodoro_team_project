window.addEventListener("load", () => {
  const input = document.querySelector("#profileChange");

  input.addEventListener("change", async function (event) {
    const file = event.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("profile_image", file);

    try {
      const response = await fetch("/myPage/profileImage", {
        method: "POST",
        body: formData, // formData는 body에 전달
      });

      const data = await response.json();
      if (data.success) {
        const profileImage = document.querySelector("#profileImage");
        profileImage.src = data.fileUrl; // 업로드된 이미지 URL로 이미지 소스 설정
      } else {
        console.error("프로필 이미지 업데이트 실패:", data.message);
      }
    } catch (error) {
      console.error("이미지 업로드 실패:", error);
    }
  });

  const closeButton = document.querySelector(".modal > .closeButton");
  const modal = document.querySelector(".modal");
  const done_button = document.querySelector(".done-button");
  const like_button = document.querySelector(".like-button");
  const ongoing_button = document.querySelector(".ongoing-button");
  const title = document.querySelector(".modal > h2");
  const ongoingModal = document.querySelector(".modal > .ongoingModal");
  const doneModal = document.querySelector(".modal > .doneModal");
  const like_feed = document.querySelector(".modal > .like_feed");
  closeButton.addEventListener("click", () => {
    modal.style.display = "";
  });

  done_button.addEventListener("click", async (event) => {
    title.innerHTML = "완료한 일정";
    ongoingModal.style.display = "";
    like_feed.style.display = "";
    doneModal.style.display = "block";
    modal.style.display = "block";
  });

  ongoing_button.addEventListener("click", (event) => {
    title.innerHTML = "미흡했던 일정";
    doneModal.style.display = "";
    like_feed.style.display = "";
    ongoingModal.style.display = "block";
    modal.style.display = "block";
  });

  like_button.addEventListener("click", (event) => {
    title.innerHTML = "좋아요 누른 피드";
    doneModal.style.display = "";
    ongoingModal.style.display = "";
    like_feed.style.display = "block";
    modal.style.display = "block";
  });
});
