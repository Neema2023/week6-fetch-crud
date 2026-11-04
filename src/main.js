import "./style.css";
import { api, HttpError } from "./http.js";
// 1. Select HTML elements
const postsContainer = document.querySelector("#posts-container");
const postsStatus = document.querySelector("#posts-status");
const postForm = document.querySelector("#post-form");
const formStatus = document.querySelector("#form-status");
const userFilter = document.querySelector("#user-filter");

// 2. Application state
let posts = [];

// 3. Render posts
function renderPosts() {
    postsContainer.innerHTML = "";

    if (posts.length === 0) {
        postsStatus.textContent = "No posts found.";
        return;
    }

    postsStatus.textContent = `${posts.length} posts found`;

    posts.forEach((post) => {
        const card = document.createElement("article");

        card.className =
            "rounded-xl bg-white p-5 shadow border border-gray-200";

        card.innerHTML = `
      <h3 class="mb-3 text-lg font-bold text-gray-900"></h3>
      <p class="mb-4 text-gray-600"></p>

      <div class="flex gap-3">
        <button class="edit-btn rounded-lg bg-yellow-500 px-4 py-2 text-white hover:bg-yellow-600">
          Edit
        </button>

        <button class="delete-btn rounded-lg bg-red-600 px-4 py-2 text-white hover:bg-red-700">
          Delete
        </button>
      </div>
    `;

        card.querySelector("h3").textContent = post.title;
        card.querySelector("p").textContent = post.body;

        // Edit button
        card.querySelector(".edit-btn").addEventListener("click", async() => {
            const newTitle = prompt("Enter the new title:", post.title);

            if (!newTitle || !newTitle.trim()) return;

            try {
                const updated = await api.patch(`/posts/${post.id}`, {
                    title: newTitle.trim(),
                });

                posts = posts.map((item) =>
                    item.id === post.id ? {...item, ...updated } :
                    item
                );

                renderPosts();
            } catch (error) {
                alert(`Update failed: ${error.message}`);
            }
        });

        // Delete button
        card.querySelector(".delete-btn").addEventListener("click", async() => {
            const confirmed = confirm("Are you sure you want to delete this post?");

            if (!confirmed) return;

            try {
                await api.del(`/posts/${post.id}`);

                posts = posts.filter((item) => item.id !== post.id);

                renderPosts();
            } catch (error) {
                alert(`Delete failed: ${error.message}`);
            }
        });

        postsContainer.appendChild(card);
    });
}

// 4. Load posts (GET)
async function loadPosts(userId = "") {
    postsStatus.textContent = "Loading posts...";
    postsContainer.innerHTML = "";

    try {
        const params = new URLSearchParams();

        if (userId) {
            params.set("userId", userId);
        } else {
            params.set("_limit", "10");
        }

        const query = params.toString();

        const path = query ? `/posts?${query}` : "/posts";

        posts = await api.get(path);

        renderPosts();
    } catch (error) {
        postsStatus.textContent = `Error loading posts: ${error.message}`;
    }
}

// 5. Populate user filter
for (let i = 1; i <= 10; i++) {
    const option = document.createElement("option");

    option.value = i;
    option.textContent = `User ${i}`;

    userFilter.appendChild(option);
}

// 6. Filter posts by user
userFilter.addEventListener("change", () => {
    loadPosts(userFilter.value);
});

// 7. Create new post (POST)
postForm.addEventListener("submit", async(event) => {
    event.preventDefault();

    const button = postForm.querySelector('button[type="submit"]');

    const formData = new FormData(postForm);

    const postData = {
        ...Object.fromEntries(formData),
        userId: 1,
    };

    button.disabled = true;
    formStatus.textContent = "Publishing post...";

    try {
        const created = await api.post("/posts", postData);

        posts.unshift(created);

        renderPosts();

        postForm.reset();

        formStatus.textContent = `Post created successfully! ID: ${created.id}`;
    } catch (error) {
        formStatus.textContent = `Could not publish: ${error.message}`;
    } finally {
        button.disabled = false;
    }
});

// 8. Initial load
loadPosts();