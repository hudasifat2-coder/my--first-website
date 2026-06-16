// Sample blog posts data
const blogPosts = [
    {
        id: 1,
        title: "Getting Started with Web Development",
        date: "June 16, 2026",
        excerpt: "Learn the basics of HTML, CSS, and JavaScript to start your web development journey.",
        content: "Full article content here..."
    },
    {
        id: 2,
        title: "Understanding CSS Flexbox",
        date: "June 15, 2026",
        excerpt: "Flexbox is a powerful layout tool. Let's explore how to use it effectively.",
        content: "Full article content here..."
    },
    {
        id: 3,
        title: "JavaScript ES6 Features",
        date: "June 14, 2026",
        excerpt: "Modern JavaScript with arrow functions, async/await, and destructuring.",
        content: "Full article content here..."
    }
];

// Load blog posts on page load
document.addEventListener('DOMContentLoaded', () => {
    loadBlogPosts();
    setupNavigation();
    setupContactForm();
});

// Function to load and display blog posts
function loadBlogPosts() {
    const postsContainer = document.getElementById('blog-posts');
    postsContainer.innerHTML = '';

    blogPosts.forEach(post => {
        const postElement = document.createElement('div');
        postElement.className = 'blog-post';
        postElement.innerHTML = `
            <div class="blog-post-header">
                <h3>${post.title}</h3>
                <p class="blog-post-date">${post.date}</p>
            </div>
            <div class="blog-post-content">
                <p>${post.excerpt}</p>
                <a href="#" class="read-more">Read More →</a>
            </div>
        `;
        postsContainer.appendChild(postElement);

        // Add click event to blog posts
        postElement.addEventListener('click', () => {
            alert(`Full article: "${post.title}"\n\n${post.content}`);
        });
    });
}

// Smooth scrolling for navigation links
function setupNavigation() {
    const links = document.querySelectorAll('.nav-links a');
    links.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const targetId = link.getAttribute('href').substring(1);
            const targetElement = document.getElementById(targetId);
            if (targetElement) {
                targetElement.scrollIntoView({ behavior: 'smooth' });
            }
        });
    });
}

// Handle contact form submission
function setupContactForm() {
    const form = document.getElementById('contact-form');
    form.addEventListener('submit', (e) => {
        e.preventDefault();
        const inputs = form.querySelectorAll('input, textarea');
        const name = inputs[0].value;
        const email = inputs[1].value;
        const message = inputs[2].value;

        // Simple validation
        if (name && email && message) {
            alert(`Thank you for your message, ${name}! I'll get back to you soon.`);
            form.reset();
        } else {
            alert('Please fill in all fields.');
        }
    });
}

// Optional: Add active navigation state
window.addEventListener('scroll', () => {
    const sections = document.querySelectorAll('section');
    const navLinks = document.querySelectorAll('.nav-links a');

    sections.forEach((section, index) => {
        const top = section.offsetTop;
        const height = section.offsetHeight;

        if (window.scrollY >= top - 200 && window.scrollY < top + height - 200) {
            navLinks.forEach(link => link.style.color = 'white');
            if (navLinks[index]) {
                navLinks[index].style.color = '#3498db';
            }
        }
    });
});