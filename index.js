// Variable constants that used on page
const posts = document.getElementById("posts");
let lastPage = 1;
let currentPage = 2;
let numLimit = 8;

// clear posts div and set page = 1
function start() {
  posts.innerHTML = "";
  lastPage = 1;
  currentPage = 2;
}

// print all posts in posts div
function showPostsInDiv(page, limit=8) {
  loader(true)
  return axios.get(`${baseUrl}/posts?limit=${limit}&page=${page}`)
  .then((response) => {

    lastPage = response.data.meta.last_page;
    for(let post of response.data.data)
    {
      let author = post.author;

      let user = JSON.parse(localStorage.getItem("user"));
      let editButton = user ? user.id == author.id ? "" : "hidden" : "hidden";

      let profileImage = typeof author.profile_image === "string" ? author.profile_image : './picture/user.png';
      // let postTitle = post.title !== null ? (post.title.includes('[') ? JSON.parse(post.title) : post.title) : '';

      let transformerDiv = document.createElement("div")

      transformerDiv.innerText = author.name;
      let authorName = transformerDiv.innerHTML;
  
      transformerDiv.innerText = post.title !== null ? post.title : '';
      let postTitle = transformerDiv.innerHTML;
  
      transformerDiv.innerText =  post.body;
      let postBody = transformerDiv.innerHTML;

      let postImage = typeof post.image === "string" ? 
      `<img class="w-100" src="${post.image}" alt="post picture">` : '';
      // let postBody = post.body.indexOf('[') !== -1 ? post.body.substring(0, post.body.indexOf('[')) : post.body;

      let model = `
      <div class="card shadow-sm mt-4">
        <div class="card-header">
          <span style="cursor:pointer;" onclick="toProfileUsers(${author.id})">
            <img class="rounded-circle border border-2 profileImg" src="${profileImage}" alt="user img">
            <h6 class="userNameHeader" style="margin: 0;">${authorName}</h6>
          </span>
          <button type="button" class="btn btn-danger float-end  mt-1 ms-1" ${editButton} onclick="openModalDeletePost(${post.id})">Delete</button>
          <button type="button" class="btn btn-secondary float-end  mt-1" ${editButton} onclick="editPostAndOpenModal(${post.id})">Edit</button>
        </div>
        <div class="card-body">
          <h3>${postTitle}</h3>
          <p>${postBody}</p>
          ${postImage}
          <h6 class="text-black-50 mt-2 mb-0 date">${post.created_at}</h6>
          <hr>
          <div>
            <span class="click me-2" onclick="postInfo(${post.id})" data-bs-toggle="modal" data-bs-target="#postInfo">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-chat-fill mb-1" viewBox="0 0 16 16">
                <path d="M8 15c4.418 0 8-3.134 8-7s-3.582-7-8-7-8 3.134-8 7c0 1.76.743 3.37 1.97 4.6-.097 1.016-.417 2.13-.771 2.966-.079.186.074.394.273.362 2.256-.37 3.597-.938 4.18-1.234A9 9 0 0 0 8 15"/>
              </svg>
              ${post.comments_count} comments</span>
            <span id="post-tags-${post.id}">
            </span>
          </div>
      </div>`
      limit !== 1 ? posts.innerHTML += model : posts.insertAdjacentHTML('afterbegin', model);
  
      let tageId = `post-tags-${post.id}`
      let postTags = document.getElementById(tageId)
      postTags.innerHTML = ""

      // if(typeof postTitle === "object" && postTitle !== null)
      if(post.tags.length !== 0)
      {
        for(let i=0; i<post.tags.length; i++)
        {
          let modelTags = `
            <button type="button" class="btn btn-secondary rounded-5 m-1">${post.tags[i].name}</button>
          `
          postTags.innerHTML += modelTags
        }
      }
    }
  })
  .catch((error) => {
    console.error(error);
  })
  .finally(() => {
    loader(false)
  })
}

// The function will be called when the user scrolls past the last 100px gap.
let isFunctionCalled = false;
function callFunctionOnce() {
  isFunctionCalled = true;
  showPostsInDiv(currentPage)
  .then(() => {
    console.log("ez")
    isFunctionCalled = false;
    currentPage++;
  })
}

// Find out when the user scrolls to the last page before 100px and check if we have other pages
window.addEventListener('scroll', () => {
    const threshold = 100;
    if (!isFunctionCalled && window.innerHeight + window.scrollY >= document.body.offsetHeight - threshold && currentPage <= lastPage) {
        callFunctionOnce();
    }
});

// Open the modal to create a post
function openModalToCreatePost() {
  let modalTitle = document.getElementById("modalTitle")
  let buttonSubmit = document.getElementById("buttonSubmit")
  let PostTitle = document.getElementById("PostTitle")
  let PostBody = document.getElementById("PostBody")
  let messageErrorP = document.getElementById("messageErrorP")

  modalTitle.textContent = "Create Post"
  buttonSubmit.textContent = "Post"
  PostTitle.value = ''
  PostBody.value = ''
  messageErrorP.textContent = ""

  let idToEditPost = document.getElementById("idToEditPost")
  idToEditPost.value = null

  let modal = new bootstrap.Modal(document.getElementById("CreateAndEditPost"));
  modal.toggle();
}

//Call the function at the beginning of the site
start()
showPostsInDiv(1)
// ================================
// Programmed by Ziad Ahmed Shalaby
// ================================