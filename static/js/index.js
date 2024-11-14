// 좋아요 모달 // 모달 열기
function openLikeModal(feedId) {
  const modal = document.getElementById(`likeModal-${feedId}`);
  if (modal) {
    modal.style.display = "block"; // 모달을 열 때
    document.body.style.overflow = "hidden"; // body의 스크롤을 막음

    fetchLikeUsers(feedId);
  }
}

// 좋아요 사용자 데이터 가져오기
function fetchLikeUsers(feedId) {
  fetch(`/api/likes/${feedId}`)
    .then((response) => response.json())
    .then((data) => {
      const likeList = document.getElementById(`likes-list-${feedId}`);

      likeList.innerHTML = ""; // 기존 목록 초기화 (새로운 값을 계속 보여주기 위해)
    });
}

// 좋아요 사용자 데이터 가져오기
function fetchLikeUsers(feedId) {
  fetch(`/api/likes/${feedId}`)
    .then((response) => response.json())
    .then((data) => {
      const likeList = document.getElementById(`likes-list-${feedId}`);

      likeList.innerHTML = ""; // 기존 목록 초기화 (새로운 값을 계속 보여주기 위해)

      // 사용자 목록 업데이트
      data.users.forEach((user) => {
        const listItem = document.createElement("li");
        // 'user' 클래스 추가
        listItem.classList.add("user");

        // profile_image가 null일 경우 기본 이미지 사용
        const profileImage = user.profile_image || "../static/img/profile.png";

        listItem.innerHTML = `
              <img src="${profileImage}" alt="${user.nickname}" class="user-profile-img" />
              <span class="user-nickname">${user.nickname}</span>
          `;
        likeList.appendChild(listItem);
      });
    })
    .catch((error) => {
      console.error(error);
    });
}

// 각 피드 좋아요 수 가져와서 업데이트
async function updateLikeCounts(feedIds) {
  for (const feedId of feedIds) {
    try {
      const response = await fetch(`/get-like-count?feedId=${feedId}`);
      const { likeCount } = await response.json();
      const likeText = document.getElementById(`like-text-${feedId}`);
      if (likeCount > 0) {
        likeText.textContent = `${likeCount}명이 해당 게시물에 공감하고 있어요`;
      } else {
        likeText.textContent = "아직 공감한 사람이 없습니다.";
      }
    } catch (error) {
      console.error("error");
    }
  }
}
// 해당 피드에 대해서만 좋아요 수 최신화
async function updateFeedLike(feedId) {
  try {
    const response = await fetch(`/get-like-count?feedId=${feedId}`);
    const { likeCount } = await response.json();

    const likeText = document.getElementById(`like-text-${feedId}`);
    if (likeCount > 0) {
      likeText.textContent = `${likeCount}명이 해당 게시물에 공감하고 있어요`;
    } else {
      likeText.textContent = "아직 공감한 사람이 없습니다.";
    }
  } catch (error) {
    console.error("error");
  }
}

// 해당 피드에 대해서만 좋아요 수 최신화
async function updateFeedLike(feedId) {
  try {
    const response = await fetch(`/get-feed-like?feedId=${feedId}`);
    const { likeCnt } = await response.json(); // likeCount를 객체로 받을 경우

    const likeText = document.getElementById(`like-text-${feedId}`);
    if (likeCnt > 0) {
      likeText.textContent = `${likeCnt}명이 해당 게시물에 공감하고 있어요`;
    } else {
      likeText.textContent = "아직 공감한 사람이 없습니다.";
    }
  } catch (error) {
    console.error("Failed to update like count", error);
  }
}

// 페이지 로드 시 좋아요 개수 업데이트
window.addEventListener("load", () => {
  const feedIds = [...document.querySelectorAll(".like-info")].map(
    (info) => info.dataset.feedId
  );
  updateLikeCounts(feedIds);
});

window.addEventListener("click", function (event) {
  var modal = event.target.closest(".like-modal"); // 클릭한 요소가 모달이라면
  var modalContent = modal ? modal.querySelector(".like-modal-content") : null; // 모달 콘텐츠 영역 찾기

  // 클릭한 요소가 모달 배경이면서 모달 콘텐츠 영역이 아닐 경우
  if (modal && !modalContent.contains(event.target)) {
    var feedId = modal.getAttribute("data-feed-id"); // data-feed-id 속성에서 feedId 값 가져오기
    closeLikeModal(feedId); // 모달 닫는 함수 호출
  }
});

// closeLikeModal 함수
function closeLikeModal(feedId) {
  var modal = document.querySelector(
    '.like-modal[data-feed-id="' + feedId + '"]'
  ); // 해당 feedId 값을 가진 모달만 찾기
  if (modal) {
    modal.style.display = "none";
    document.body.style.overflow = "";
  }
}

// 페이지 로드 시, 서버에서 받아온 좋아요 상태에 따라 하트 아이콘을 업데이트
async function setLikeStatusOnPageLoad() {
  try {
    const response = await fetch("/get-like-status");
    const feedLikeStatus = await response.json();

    // 각 피드에 대해 좋아요 상태를 업데이트
    feedLikeStatus.forEach(({ feedId, liked }) => {
      const heartIcon = document.getElementById(`likeIcon-${feedId}`);
      if (heartIcon) {
        if (liked) {
          heartIcon.classList.add("liked"); // 좋아요가 되어 있으면 하트 아이콘 활성화
        } else {
          heartIcon.classList.remove("liked"); // 좋아요가 되어 있지 않으면 비활성화
        }
      }
    });
  } catch (error) {
    console.error("Failed to fetch like status", error);
  }
}
// 페이지 로드 시 실행
window.addEventListener("load", setLikeStatusOnPageLoad());

function toggleCommentBox() {
  const commentBox = document.getElementById("commentBox");
  const plusIcon = document.querySelector(".plus-icon");

  commentBox.classList.toggle("active");

  if (commentBox.classList.contains("active")) {
    document.getElementById("commentInput").focus();
    plusIcon.style.display = "none";
  } else {
    plusIcon.style.display = "block";
  }
}

async function toggleLike(feedId) {
  try {
    const response = await fetch(`/toggle-like?feedId=${feedId}`, {
      method: "POST",
    });
    const data = await response.json();

    const heartIcon = document.getElementById(`likeIcon-${feedId}`);
    if (data.liked) {
      heartIcon.classList.add("liked"); // 좋아요 버튼 활성화 (빨간색 하트로 변경)
    } else {
      heartIcon.classList.remove("liked"); // 좋아요 버튼 비활성화 (기본 하트로 변경)
    }

    updateFeedLike(feedId);
  } catch (error) {
    console.error("Failed to toggle like", error);
  }
}
function toggleCommentBox() {
  const commentBox = document.getElementById("commentBox");
  const plusIcon = document.querySelector(".plus-icon");

  commentBox.classList.toggle("active");

  if (commentBox.classList.contains("active")) {
    document.getElementById("commentInput").focus();
    plusIcon.style.display = "none";
  } else {
    plusIcon.style.display = "block";
  }
}

let currentEditComment = null;
// 댓글 전송 함수
function submitComment() {
  const commentInput = document.getElementById("commentInput");
  const commentText = commentInput.value;
  console.log(commentText);

  // 버튼 클릭시 해당 댓글 insert




  const userID = "User123"; // 여기 데이터베이스 가져와서 유저 아이디 가져와야해요!!!

  if (currentEditComment) {
    currentEditComment.querySelector("p").textContent = commentText;
    currentEditComment = null;
  } else if (commentText) {
    addCommentToDOM(userID, commentText);
  }
  commentInput.value = "";
}

// 댓글을 화면에 추가하는 함수
function addCommentToDOM(userID, commentText) {
  
  const profileImg = '/static/img/profile.png'

  const commentsContainer = document.getElementById("commentsContainer");
  const commentElement = document.createElement("div");
  commentElement.classList.add("comment");

  // 유저 ID와 댓글 내용을 함께 표시
  commentElement.innerHTML = `
    <div class="profile-img">
      <img src="${profileImg}" alt="프로필 이미지" width="30px"/>
    </div>
    <div class="comment-content">
      <strong>${userID}</strong>
      <p>${commentText}</p>
      <div class="comment-actions">
        <button onclick="editComment(this)">수정</button>
        <button onclick="deleteComment(this)">삭제</button>
      </div>
    </div>
  `;

  commentsContainer.appendChild(commentElement);
  commentsContainer.scrollTop = commentsContainer.scrollHeight;
}

// 댓글 수정 함수
function editComment(button) {
  const commentElement = button.closest(".comment");
  const commentTextElement = commentElement.querySelector("p");
  const commentInput = document.getElementById("commentInput");
  commentInput.value = commentTextElement.textContent;
  currentEditComment = commentElement;
}

// 댓글 삭제 함수
function deleteComment(button) {
  const commentElement = button.closest(".comment");
  if (confirm("정말로 이 댓글을 삭제하시겠습니까?")) {
    commentElement.remove();
  }
}

// 다른 화면 클릭 시 댓글창 닫기
document.addEventListener("click", function (e) {
  const commentBox = document.getElementById("commentBox");
  const plusIcon = document.querySelector(".plus-icon");
  if (
    !e.target.closest(".comment-box") &&
    !e.target.closest(".icon-container img")
  ) {
    commentBox.classList.remove("active");
    plusIcon.style.display = "block";
  }
});

// 피드 올리는 아이콘 클릭 시 feed.ejs로 이동
function goToFeed() {
  window.location.href = "./feed";
}

// 피드 삭제 함수
function feedDelete(feedId) {
  Swal.fire({
    icon: "warning",
    text: "정말 삭제하시겠습니까?",
    showCancelButton: true,
    confirmButtonText: "확인",
    cancelButtonText: "취소",
  }).then((result) => {
    // '확인' 버튼을 눌렀을 경우 삭제 함수 실행
    if (result.isConfirmed) {
      fetch(`/feeds/delete/${feedId}`, {
        method: "DELETE",
      })
        .then((response) => {
          if (response.ok) {
            Swal.fire({
              icon: "success",
              text: "피드가 삭제되었습니다.",
              confirmButtonText: "확인",
            }).then(() => {
              // 삭제 후 페이지를 새로고침하거나 해당 피드 아이템만 삭제
              document
                .querySelector(`.feed-item[data-feed-id="${feedId}"]`)
                .remove();
            });
          } else {
            Swal.fire({
              icon: "error",
              text: "삭제하는 중 오류가 발생했습니다.",
              confirmButtonText: "확인",
            });
          }
        })
        .catch((error) => {
          Swal.fire({
            icon: "error",
            text: "서버와의 통신 중 오류가 발생했습니다.",
            confirmButtonText: "확인",
          });
        });
    }
  });
}

// 피드 수정 함수
function feedEdit(feedId) {
  document.getElementById(`img-input-${feedId}`).style.display = "none";

  const editContainer = document.getElementById(`edit-container-${feedId}`);
  const feedContent = document.getElementById(`feed-content-${feedId}`);
  const feedImage = document.getElementById(`feed-img-${feedId}`);

  // 수정 칸 토글 (보이기 / 숨기기)
  if (editContainer.style.display === "none") {
    editContainer.style.display = "block"; // 수정 칸 보이기
    feedContent.style.display = "none"; // 기존 내용 숨기기
    feedImage.style.display = "none"; // 기존 이미지 숨기기
  } else {
    editContainer.style.display = "none"; // 수정 칸 숨기기
    feedContent.style.display = "block"; // 기존 내용 보이기
    feedImage.style.display = "block"; // 기존 이미지 보이기
  }
}

// 사용자가 수정버튼을 누르고 그다음 파일선택을 눌렀을때 실행되는 함수
function updateImage(feedId, fileUrl) {
  // 기존 이미지 경로
  const baseFileUrl = fileUrl;
  // input file
  const input = document.getElementById(`img-input-${feedId}`);
  // 사용자가 이미지를 변경하면 이미지 src값을 변경
  const imgPreview = document.getElementById(`edit-img-${feedId}`);
  // 사용자가 어떤 파일을 선택했는지
  const fileInfoContainer = input.nextElementSibling.nextElementSibling;

  const spanFileName = fileInfoContainer.querySelector(".span-file"); // 선택된 파일 이름을 표시하는 span
  const errorMessage = fileInfoContainer.querySelector(".error-message"); // 에러 메시지

  // 사용자가 하나의 파일을 선택했을때만 실행한다.
  if (input.files && input.files[0]) {
    const reader = new FileReader();

    const file = input.files[0];
    const filename = file.name;
    const fileExtension = filename.split(".").pop().toLowerCase(); // 파일 확장자 추출

    // 허용 확장자
    const allowedExtensions = ["jpeg", "jpg", "png", "bmp"];

    if (allowedExtensions.includes(fileExtension)) {
      // 파일 이름 표시
      spanFileName.textContent = filename;
      // 에러 메시지 숨기기
      errorMessage.style.display = "none";

      // 이미지 미리보기 업데이트
      reader.onload = function (e) {
        imgPreview.src = e.target.result;
      };
      reader.readAsDataURL(input.files[0]);
    } else {
      // 확장자가 맞지 않으면 경고 메시지 표시
      spanFileName.textContent = "파일을 다시 선택하세요!.";
      errorMessage.style.display = "block"; // 경고 메시지 표시
    }
  } else {
    // 파일이 선택되지 않은 경우
    spanFileName.textContent = "선택된 파일이 없습니다.";
    errorMessage.style.display = "none";
  }
}

// 저장 버튼 클릭 시
function saveChanges(feedId) {
  Swal.fire({
    title: "저장하시겠습니까?",
    text: "변경된 내용을 저장하려면 확인을 클릭해주세요.",
    icon: "question",
    showCancelButton: true,
    confirmButtonText: "확인",
    cancelButtonText: "취소",
  }).then((result) => {
    if (result.isConfirmed) {
      // 확인을 눌렀을 때 서버로 업데이트 요청 보내기
      const newContent = document.getElementById(
        `edit-content-${feedId}`
      ).value;
      const newImageFile = document.getElementById(`img-input-${feedId}`)
        .files[0];

      if (!newContent || !newImageFile) {
        Swal.fire({
          icon: "error",
          title: "입력 오류",
          text: "수정할 내용 또는 이미지를 선택해주세요!",
          confirmButtonText: "확인",
        });
        return; // 폼 제출을 중단
      }

      const formData = new FormData();
      formData.append("content", newContent);
      formData.append("feedId", feedId);

      if (newImageFile) {
        formData.append("image", newImageFile);
      }

      // 서버로 요청 보내기
      fetch("/feeds/update", {
        method: "POST",
        body: formData,
      })
        .then((response) => response.json())
        .then((data) => {
          // 새 이미지 URL 적용 (타임스탬프 추가)
          const newImageElement = document
            .getElementById(`feed-img-${feedId}`)
            .querySelector("img");
          const newContentParagraph = document
            .getElementById(`feed-content-${feedId}`)
            .querySelector("p");
          // 업데이트 전 초기화하기
          newImageElement.src = null;
          newContentParagraph.textContent = null;

          // 수정 칸 숨기기
          const editContainer = document.getElementById(
            `edit-container-${feedId}`
          );
          editContainer.style.display = "none"; // 수정 칸 숨기기
          document.getElementById(`feed-content-${feedId}`).style.display =
            "block"; // 기존 내용 보이기
          document.getElementById(`feed-img-${feedId}`).style.display = "block"; // 이미지 보이기

          Swal.fire({
            icon: "success",
            title: "변경 완료",
            text: "피드가 성공적으로 업데이트되었습니다.",
            confirmButtonText: "확인",
          });
          // 새 이미지와 내용 적용
          newImageElement.src = `${
            data.newImageUrl
          }?timestamp=${new Date().getTime()}`;
          newContentParagraph.textContent = data.content;
        })
        .catch((error) => {
          console.log("피드 업데이트 실패", error);
          Swal.fire({
            icon: "error",
            title: "오류 발생",
            text: "서버와 연결하는데 문제가 발생했습니다.",
            confirmButtonText: "확인",
          });
        });
    } else {
      // 취소 버튼을 눌렀을 때
      Swal.fire({
        icon: "info",
        title: "취소되었습니다",
        text: "피드 수정이 취소되었습니다.",
        confirmButtonText: "확인",
      });
    }
  });
}

// 사용자가 수정을 누르고 취소버튼을 클릭했을 때
function cancelEdit(feedId) {
  // 수정 컨테이너, 피드 내용, 이미지 요소 찾기
  const editContainer = document.getElementById(`edit-container-${feedId}`);
  const feedContent = document.getElementById(`feed-content-${feedId}`);
  const feedImage = document.getElementById(`feed-img-${feedId}`);

  // 수정 영역 숨기고 원래 내용과 이미지 보이기
  feedContent.style.display = "block"; // 원래 내용 보이기
  feedImage.style.display = "block"; // 원래 이미지 보이기
  editContainer.style.display = "none"; // 수정 영역 숨기기

  // 알림 창을 오른쪽 상단에 띄운다.
  toastr.info("피드 수정을 취소했습니다.", {
    positionClass: "toast-top-right", // 오른쪽 상단에 띄우기
    timeOut: 2000, // 3초 후 자동으로 사라짐
  });
}

// 댓글 값 가져오기

