// Variable constants that used on all pages
const baseUrl = "https://tarmeezacademy.com/api/v1";
const scrollTopBtn = document.getElementById("scrollTopBtn");

//Find the page name
let pagePath = window.location.pathname;
let pageName = pagePath.split('/').pop();

// Show the scroll top button if the user scrolls 200px
window.onscroll = function() {
  if (window.scrollY > 200) { 
    scrollTopBtn.style.display = "block";
  } else {
    scrollTopBtn.style.display = "none";
  }
};

// Go to the top of the page
scrollTopBtn.addEventListener("click", () => {
    window.scrollTo({top: 0, behavior: 'smooth' });
});

// Show success, danger, warning, .... alert
function successAlert(appendMessage, appendType) {
    const alertPlaceholder = document.getElementById('successAlert')
    const appendAlert = (message, type) => {
        const wrapper = document.createElement('div')
        wrapper.id = "hideAlert"
        wrapper.className = "mt-4 show fade"
        wrapper.innerHTML = [
        `<div class="alert alert-${type} alert-dismissible" role="alert">`,
        `   <div>${message}</div>`,
        '   <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>',
        '</div>'
        ].join('')

        alertPlaceholder.append(wrapper)
    }

    appendAlert(appendMessage, appendType)

    setTimeout(() => {
        const alert = bootstrap.Alert.getOrCreateInstance('#hideAlert')
        alert.close()
    }, 3000)
}

// Edit the navbar if the user is logged in or logged out
function setNavBar() {
    let token = localStorage.getItem("token");
    let user = JSON.parse(localStorage.getItem("user"));
    let profileImg = user ? typeof user.profile_image === "string" ? user.profile_image : './picture/user.png' : './picture/user.png'

    let buttonsRL = document.getElementById("buttonsRL");
    let loggedin = document.getElementById("loggedin");
    let ShowPlus = document.getElementById("ShowPlus");

    if(token)
    {
        let model = `
        <span class="d-flex gap-2 align-items-center" style="cursor: pointer" onclick="permisionToProfile()">
            <h5>${user.name}</h5>
            <img src="${profileImg}" class="rounded-circle border border-2 profileImg">
        </span>
        <button type="button" class="btn btn-outline-danger" onclick="logout()">Logout</button>
        `
        loggedin.innerHTML = model;

        buttonsRL.setAttribute('style', 'display: none !important');
        loggedin.setAttribute('style', 'display: flex !important');
        if(ShowPlus) ShowPlus.setAttribute('style', 'display: block !important; box-shadow: 0px 2px 5px 0px rgba(0,0,0,0.5);');
    }
    else
    {
        loggedin.innerHTML = '';
        buttonsRL.setAttribute('style', 'display: block !important');
        loggedin.setAttribute('style', 'display: none !important');
        if(ShowPlus) ShowPlus.setAttribute('style', 'display: none !important');
    }
}

// show comment model if user logged in
function showCommentButton() {
    let token = localStorage.getItem("token");
    let CreateComment = document.getElementById("CreateComment")

    if(token) 
    {
        CreateComment.setAttribute('style', 'display: flex !important');
    }
    else 
    {
        CreateComment.setAttribute('style', 'display: none !important');
    }
}

// Function to register a new user
function register() {
    document.getElementById("messageErrorR").innerHTML = "";
    const FirstName = document.getElementById("FirstName").value;
    const Email = document.getElementById("Email").value;
    const Username = document.getElementById("Username").value;
    const Password = document.getElementById("Password").value;
    const ConfirmPassword = document.getElementById("ConfirmPassword").value;
    const ProfileImg = document.getElementById("ProfileImg").files[0];

    if(Password == ConfirmPassword)
    {
        const form = new FormData();
        form.append('name', FirstName);
        form.append('email', Email);
        form.append('username', Username);
        form.append('password', Password);
        // if(ProfileImg) form.append('image', ProfileImg);

        loader(true)
        axios.post(`${baseUrl}/register`, form)
        .then((response) => {
            localStorage.setItem("token", response.data.token);
            localStorage.setItem("user", JSON.stringify(response.data.user));
            
            const myModalEl = document.getElementById("Register")
            bootstrap.Modal.getInstance(myModalEl).hide();
            
            successAlert('Registered Successfully.', 'success');
            setNavBar();
            if(pageName === "index.html")
            {
                start();
                showPostsInDiv(1);
            }
            else if(pageName === "profile.html")
            {
                beforDoingAnyThing();
            }
        })
        .catch((error) => {
            if(error.response.data.message)
            {
                let model = `
                <div class="text-center p-3 pt-0">
                <span class="text-danger">${error.response.data.message}</span>
                </div>`
                document.getElementById("messageErrorR").innerHTML = model;
            }
        })
        .finally(() => {
            loader(false)
        })
    }
    else
    {
        let model = `
        <div class="text-center p-3 pt-0">
        <span class="text-danger">Password does not match the confirm password.</span>
        </div>`
        document.getElementById("messageErrorR").innerHTML = model;
    }
}

// Function to login user
function loginUser() {
    document.getElementById("messageError").innerHTML = "";
    const UsernameLogin = document.getElementById("UsernameLogin").value;
    const PasswordLogin = document.getElementById("PasswordLogin").value;

    const params = {
        "username" : UsernameLogin,
        "password" : PasswordLogin
    }

    loader(true)
    axios.post(`${baseUrl}/login`, params)
    .then((response) => {
        localStorage.setItem("token", response.data.token);
        localStorage.setItem("user", JSON.stringify(response.data.user));

        const myModalEl = document.getElementById("Login")
        bootstrap.Modal.getInstance(myModalEl).hide();

        successAlert('logged in successfully.', 'primary');
        setNavBar();
        if(pageName === "index.html")
        {
            start();
            showPostsInDiv(1);
        }
        else if(pageName === "profile.html")
        {
            beforDoingAnyThing();
        }
    })
    .catch((error) => {
        if(error.response.data.message)
        {
            let model = `
                    <div class="text-center p-3 pt-0">
                    <span class="text-danger">${error.response.data.message}</span>
                    </div>`
            document.getElementById("messageError").innerHTML = model;
        }
    })
    .finally(() => {
        loader(false)
    })
}

// Function to logout user
function logout() {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    successAlert('logged out successfully.', 'danger');
    setNavBar();
    if(pageName === "index.html")
    {
        start();
        showPostsInDiv(1);
    }
    else if(pageName === "profile.html")
    {
        beforDoingAnyThing();
    }
}

// Show user image in input circle before submitting recording
const ProfileImg = document.getElementById("ProfileImg");
ProfileImg.addEventListener("input", () => {
  const imageBtn = document.getElementById("imageBtn");

  if(ProfileImg.files[0]) 
  {
    const reader = new FileReader();
    reader.onload = function(e) {
      imageBtn.src = e.target.result;
    };
    reader.readAsDataURL(ProfileImg.files[0]);
    imageBtn.style.padding = "0";
  }
})

// Clear the error message in the login and registration form
function clearRL() {
    document.getElementById("messageErrorR").innerHTML = "";
    document.getElementById("messageError").innerHTML = "";
}

// Go to user profile if user is logged in
function permisionToProfile() {
    let user = JSON.parse(localStorage.getItem("user"))
    if(user)
    {
        window.location.href = `profile.html?userId=${user.id}`
    }
    else
    {
        successAlert("You must be logged in.", "warning")
    }
}

// Create and edit post user
function CreateAndEditPost() {
    document.getElementById("messageErrorP").innerHTML = "";
    const PostTitle = document.getElementById("PostTitle").value;
    const PostBody = document.getElementById("PostBody").value;
    const PostImg = document.getElementById("PostImg").files[0];

    ///////////////////
    const tags = document.querySelectorAll('input[name="tags"]');
    let arrayTags = []
    for(let tag of tags)
    {
        if(tag.checked) arrayTags.push(tag.value)
    }
    /////////////////

    const form = new FormData();
    form.append('title', PostTitle);
    form.append('body', PostBody);
    if(PostImg) form.append('image', PostImg);

    const token = localStorage.getItem("token")
    const config = {
        headers: {
            "Authorization" : `Bearer ${token}`,
        }
    }

    let url = ''
    let messageAlert = ''
    let idToEditPost = document.getElementById("idToEditPost").value
    if(idToEditPost)
    {
        form.append('_method', "put");
        url = `${baseUrl}/posts/${idToEditPost}`
        messageAlert = 'Edited Post successfully.'
        numLimit = 8;
    }
    else
    {
        url = `${baseUrl}/posts`
        messageAlert = 'Created Post successfully.'
        numLimit = 1;
    }

    loader(true)
    axios.post(url, form, config)
    .then((response) => {
        const myModalEl = document.getElementById("CreateAndEditPost")
        bootstrap.Modal.getInstance(myModalEl).hide();

        successAlert(messageAlert, 'success');

        if(pageName === "index.html")
        {
            if(idToEditPost) start()
            showPostsInDiv(1,numLimit)
        }
        else if(pageName === "profile.html")
        {
            beforDoingAnyThing()
        }
    })
    .catch((error) => {
        if(error.response.data.message)
        {
            let model = `
                    <div class="text-center p-3 pt-0">
                    <span class="text-danger">${error.response.data.message}</span>
                    </div>`
            document.getElementById("messageErrorP").innerHTML = model;
        }
    })
    .finally(() => {
        loader(false)
    })
}

// Display post information in modal with comments
function postInfo(id) {
    let modalTitle = document.getElementById("modal-title")
    let modalBody = document.getElementById("modal-body");
    modalBody.innerHTML = ""

    setTimeout(() => {loader(true)}, 50);
    axios.get(`${baseUrl}/posts/${id}`)
    .then((response) => {
        let post = response.data.data;
        let author = post.author;

        let profileImage = typeof author.profile_image === "string" ? author.profile_image : './picture/user.png';
        let postImage = typeof post.image === "string" ? 
        `<img class="w-100" src="${post.image}" alt="post picture">` : '';

        let transformerDiv = document.createElement("div")

        transformerDiv.innerText = author.name;
        let authorName = transformerDiv.innerHTML;
        modalTitle.innerHTML = authorName;

        transformerDiv.innerText = post.title !== null ? post.title : '';
        let postTitle = transformerDiv.innerHTML;

        transformerDiv.innerText =  post.body;
        let postBody = transformerDiv.innerHTML;

        let user = JSON.parse(localStorage.getItem("user"));
        let userImage = user ? typeof user.profile_image === "string" ? user.profile_image : './picture/user.png' : './picture/user.png';

        let model = `
            <div class="card mt-4 border-0">
                <div class="card-header bg-primary-subtle">
                    <span style="cursor: pointer" onclick="toProfileUsers(${author.id})">
                        <img class="rounded-circle border border-2 profileImg" src="${profileImage}" alt="user img">
                        <h6 class="userNameHeader" style="margin: 0;">${authorName}</h6>
                    </span>
                </div>
                <div class="card-body">
                    <h3>${postTitle}</h3>
                    <p>${postBody}</p>
                    ${postImage}
                    <h6 class="text-black-50 mt-2 mb-0 date">${post.created_at}</h6>
                    <hr>
                    <div>
                        <span class="click me-2" data-bs-toggle="modal" data-bs-target="#postInfo">
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-chat-fill mb-1" viewBox="0 0 16 16">
                            <path d="M8 15c4.418 0 8-3.134 8-7s-3.582-7-8-7-8 3.134-8 7c0 1.76.743 3.37 1.97 4.6-.097 1.016-.417 2.13-.771 2.966-.079.186.074.394.273.362 2.256-.37 3.597-.938 4.18-1.234A9 9 0 0 0 8 15"/>
                        </svg>
                        ${post.comments_count} comments</span>
                        <span id="post-tags-${post.id}">
                        </span>
                    </div>
                </div>
                <div id="comments" class="card-footer text-body-secondary bg-white py-4">
                    <!-- Creat Comment -->
                    <div class="d-flex gap-2 sticky-bottom bg-white>
                        <img class="rounded-circle border border-2 profileImg" src="${userImage}" alt="user img">
                        <div class="input-group mb-3 mt-2">
                            <input type="text" class="form-control" placeholder="Comment" aria-label="Recipient's username" aria-describedby="button-addon2">
                            <button class="btn btn-outline-secondary" type="button" id="button-addon2">Submit</button>
                        </div>
                    </div>
                    <!--// Creat Comment //-->
                </div>
            </div>`
            
        modalBody.innerHTML = model;

        let tageId = `post-tags-${post.id}`
        let postTags = document.getElementById(tageId)
        postTags.innerHTML = ""

        if(post.tags.length !== 0)
        {
            for(let i=0; i<post.tags.length; i++)
            {
                let modelTges = `
                <button type="button" class="btn btn-secondary rounded-5 m-1">${post.tags[i].name}</button>
                `
                postTags.innerHTML += modelTges
            }
        }

        let comments = document.getElementById("comments");
        comments.innerHTML = '';
        for(let comment of post.comments)
        {
            let profileImage = typeof comment.author.profile_image === "string" ? comment.author.profile_image : './picture/user.png';
            let modelComment = `<!-- comment -->
                <div class="d-flex gap-2 mb-4">
                    <img class="rounded-circle border border-2 profileImg" src="${profileImage}" alt="user img" style="cursor: pointer" onclick="toProfileUsers(${comment.author.id})">
                    <div class="bg-body-secondary py-3 px-4" style="border-radius: 20px;">
                        <span style="cursor: pointer" onclick="toProfileUsers(${comment.author.id})"><strong>${comment.author.name}</strong></span>
                        <div class="mt-2">
                            ${comment.body}
                        </div>
                    </div>
                </div>
                <!--// comment //-->`

            comments.innerHTML += modelComment;
        }
        comments.innerHTML += `<!-- Creat Comment -->
        <div class="d-flex gap-2 sticky-bottom bg-white py-4" id="CreateComment">
        <img class="rounded-circle border border-2 profileImg" src="${userImage}" alt="user img">
        <div class="input-group mb-3 mt-2">
            <textarea id="addcomment" rows="1"  type="text" class="form-control" placeholder="Comment" aria-label="Recipient's username" aria-describedby="button-addon2"></textarea>
            <button class="btn btn-outline-primary" type="button" id="button-addon2" onclick="addComment(${post.id})">Submit</button>
        </div>
        </div>
        <!--// Creat Comment //-->`
        showCommentButton();
    })
    .catch((error) => {
        console.error(error)
    })
    .finally(() => {
        loader(false)
    })
}

// Add new comment
function addComment(id) {
    const addcomment = document.getElementById("addcomment").value
    const body = {
        body: addcomment,
    }

    const token = localStorage.getItem("token")
    const config = {
        headers: {
            "Authorization" : `Bearer ${token}`,
        }
    }

    if(addcomment)
    {
        loader(true)
        axios.post(`${baseUrl}/posts/${id}/comments`,body,config)
        .then((response) => {
            postInfo(id)
        })
        .catch((error) => {
            console.error(error)
        })
        .finally(() => {
            loader(false)
        })
    }
}

// Edit post information without submitting the edit and opening the modal
function editPostAndOpenModal(id) {
    loader(true)
    axios.get(`${baseUrl}/posts/${id}`)
    .then((response) => {
        let post = response.data.data;

        let modalTitle = document.getElementById("modalTitle")
        let buttonSubmit = document.getElementById("buttonSubmit")
        let PostTitle = document.getElementById("PostTitle")
        let PostBody = document.getElementById("PostBody")
        let messageErrorP = document.getElementById("messageErrorP")

        modalTitle.textContent = "Edit Post"
        buttonSubmit.textContent = "Edit"
        PostTitle.value = post.title
        PostBody.value = post.body
        messageErrorP.textContent = ""

        let idToEditPost = document.getElementById("idToEditPost")
        idToEditPost.value = id

        let modal = new bootstrap.Modal(document.getElementById("CreateAndEditPost"));
        modal.toggle();
    })
    .catch((error) => {
        console.error(error)
    })
    .finally(() => {
        loader(false)
    })
}

// Open the post deletion modal
function openModalDeletePost(id) {
    let idDelete = document.getElementById("idDelete")
    idDelete.value = id;

    let modal = new bootstrap.Modal(document.getElementById("DeletePost"));
    modal.toggle();
}

//Delete post
function deletePost() {
    let id = document.getElementById("idDelete").value
    const token = localStorage.getItem("token")
    const config = {
        headers: {
            "Authorization" : `Bearer ${token}`,
        }
    }

    loader(true)
    axios.delete(`${baseUrl}/posts/${id}`,config)
    .then((response) => {
        const myModalEl = document.getElementById("DeletePost")
        bootstrap.Modal.getInstance(myModalEl).hide();

        if(pageName === "index.html")
        {
            start()
            showPostsInDiv(1)
        }
        else if(pageName === "profile.html")
        {
            beforDoingAnyThing()
        }
        successAlert("Post has been deleted successfully.","success ")
    })
    .catch((error) => {
        if(error.response.data.error_message)
        {
            let model = `
                    <div class="text-center p-3">
                    <span class="text-danger">${error.response.data.error_message}</span>
                    </div>`
            document.getElementById("messageErrorD").innerHTML = model;
        }
    })
    .finally(() => {
        loader(false)
    })
}

// To go to the user profile
function toProfileUsers(id) {
    window.location.href = `profile.html?userId=${id}`;
}

// Toggle loader
function loader(Switch) {
    let loader = document.getElementById("loader")
    loader.style.display = Switch ? "block" : "none";
}

//Call the function at the beginning of the site
setNavBar();
// ================================
// Programmed by Ziad Ahmed Shalaby
// ================================