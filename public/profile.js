// Requests and displays information about the logged in user or any user.
function setProfileCard(userId) {
  let containerProfile = document.getElementById("containerProfile")
  containerProfile.innerHTML = ''
  let profileImg = ''
  let name = ''
  let username = ''
  let email = ''
  let postsCount = 0
  let commentsCount = 0

  loader(true)
  axios.get(`${baseUrl}/users/${userId}`)
  .then((response) => {
    user = response.data.data

    profileImg = typeof user.profile_image === "string" ? user.profile_image : "./picture/user.png"
    name = user.name
    username = user.username
    email = user.email
    postsCount = user.posts_count
    commentsCount = user.comments_count

    let userLoggedIn = JSON.parse(localStorage.getItem("user"))
    let editProfileBtn = userLoggedIn ? user.id === userLoggedIn.id ? 
    `<button class="btn btn-primary m-3" style="position: absolute; right: 0; top: 0;" onclick="openModelEditProfile('${name}','${email}','${username}',${user.id},${userLoggedIn.id})">Edit profile</button>`
    : "" : ""

    let model = `        
        <!-- profile card -->
        <div class="card mb-5">
            <div class="card-body">
                <div class="mb-2 d-flex align-items-center gap-3 flex-wrap">
                    <img class="rounded-circle" style="width: 150px; height: 150px; border: 1px solid gray;" src="${profileImg}">
                    ${editProfileBtn}
                    <h1 class="">${name}</h1>
                </div>
                <div class="d-flex justify-content-between gap-3 flex-wrap">
                    <div class="d-flex flex-column justify-content-evenly">
                        <span>
                            <strong>Name: </strong>
                            <span class="text-info">${name}</span>
                        </span>
                        <span>
                            <strong>Email: </strong>
                            <span class="text-info">${email}</span>
                        </span>
                        <span>
                            <strong>Username: </strong>
                            <span class="text-info">${username}</span>
                        </span>
                    </div>
                    <div class="d-flex flex-column justify-content-evenly">
                        <span>
                            <span class="fs-1 text-info">${postsCount}</span>
                            <span>Posts count</span>
                        </span>
                        <span>
                            <span class="fs-1 text-info">${commentsCount}</span>
                            <span>Comments count</span>
                        </span>
                    </div>
                </div>
            </div>
          </div>
        <!--// profile card //-->`
    containerProfile.innerHTML = model
    document.getElementById("titlePosts").innerHTML = `<h1><span class="text-info">${name}'s</span> posts</h1>`
    showPostsInDivProfile(userId)
  })
  .catch((error) => {
    console.error(error)
    showNoUser()
  })
  .finally(() => {
    loader(false)
  })
}

// show message error "no user found" if no user id 
function showNoUser() {
  document.getElementById("containerProfile").innerHTML = `<div class="w-100 d-flex justify-content-center align-items-center"
    style="height:80vh; font-size: 100px; font-weight: bold;">No user found!</div>`
}

//Check if the user is logged in or the user is trying to show another user if neither of them we return him to the home page
function beforDoingAnyThing() {
  let queryString = window.location.search;
  let urlParams = new URLSearchParams(queryString);
  let userId = urlParams.get("userId");

  if(userId)
  {
    setProfileCard(userId)
  }
  else
  {
    showNoUser()
  }
}

// print all posts in posts div
function showPostsInDivProfile(userId) {
  loader(true)
  axios.get(`${baseUrl}/users/${userId}/posts`)
  .then((response) => {
    posts.innerHTML = ""
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
  
      posts.innerHTML += model

      let tageId = `post-tags-${post.id}`
      let postTags = document.getElementById(tageId)
      postTags.innerHTML = ""

      // if(typeof postTitle === "object" && postTitle !== null)
      if(post.tags.length !== 0)
      {
        for(let i=0; i<post.tags.length; i++)
        {
          let model = `
            <button type="button" class="btn btn-secondary rounded-5 m-1">${post.tags[i].name}</button>
          `
          postTags.innerHTML += model
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

// Open the modal to edit the user profile
function openModelEditProfile(name,email,username,userId,userLoggedInId) {
  let messageErrorEDIT = document.getElementById("messageErrorEDIT")
  messageErrorEDIT.innerHTML = ""

  let checkbuttonedit = document.getElementById("checkbuttonedit")
  let nameEDIT = document.getElementById("nameEDIT")
  let emailEDIT = document.getElementById("emailEDIT")
  let usernameEDIT = document.getElementById("usernameEDIT")

  if(userId === userLoggedInId)
  {
    checkbuttonedit.value = userId;
    nameEDIT.value = name
    emailEDIT.value = email
    usernameEDIT.value = username
    let modal = new bootstrap.Modal(document.getElementById("editProfile"));
    modal.toggle();
  }
  else
  {
    successAlert("You are not authorized to perform this action.", "danger");
  }
}

// Edit the user profile
function updateProfile() {
  let checkbuttonedit = document.getElementById("checkbuttonedit").value
  let userLoggedIn = JSON.parse(localStorage.getItem("user"))

  let messageErrorEDIT = document.getElementById("messageErrorEDIT")

  let nameEDITED = document.getElementById("nameEDIT").value
  let emailEDITED = document.getElementById("emailEDIT").value
  let token = ''

  if(Number(checkbuttonedit) === Number(userLoggedIn.id)) 
  {
    token = localStorage.getItem("token")
  }

  const form = new FormData();
  form.append('name', nameEDITED);
  if(emailEDITED !== userLoggedIn.email) form.append('email', emailEDITED);
  form.append('_method', "put");

  const config = {
      headers: {
          "Authorization" : `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
      }
  }

  loader(true)
  axios.post(`${baseUrl}/updatePorfile`, form , config)
  .then((response) => {
    const myModalEl = document.getElementById("editProfile")
    bootstrap.Modal.getInstance(myModalEl).hide();
    logout();
  })
  .catch((error) => {
    error = error.response.data.message
    if(error == "Server Error") {
      const myModalEl = document.getElementById("editProfile")
      bootstrap.Modal.getInstance(myModalEl).hide();
      logout();
    }
    else
    {
      let model = `
      <div class="text-center p-3 pt-0">
        <span class="text-danger">${error}</span>
      </div>`
      messageErrorEDIT.innerHTML = model
    }
  })
  .finally(() => {
    loader(false)
  })
}

//Call the function at the beginning of the site
beforDoingAnyThing();
// ================================
// Programmed by Ziad Ahmed Shalaby
// ================================