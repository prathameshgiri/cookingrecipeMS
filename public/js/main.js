document.addEventListener('DOMContentLoaded', () => {
    // DOM Elements
    const recipeGrid = document.getElementById('recipe-grid');
    const modal = document.getElementById('recipe-modal');
    const closeBtn = document.querySelector('.close-btn');
    const modalBody = document.getElementById('modal-body');
    const contactForm = document.getElementById('contact-form');
    const contactStatus = document.getElementById('contact-status');

    let allRecipes = [];

    // Fetch recipes from the server
    const fetchRecipes = async () => {
        try {
            const response = await fetch('/api/recipes');
            const recipes = await response.json();
            allRecipes = recipes;
            displayRecipes(recipes);
        } catch (error) {
            console.error('Error fetching recipes:', error);
            recipeGrid.innerHTML = '<p>Error loading recipes. Please try again later.</p>';
        }
    };

    // Display recipes in the grid
    const displayRecipes = (recipes) => {
        recipeGrid.innerHTML = '';
        recipes.forEach(recipe => {
            const card = document.createElement('div');
            card.classList.add('recipe-card');
            card.innerHTML = `
                <img src="${recipe.image}" alt="${recipe.title}" class="recipe-img">
                <div class="recipe-info">
                    <h3>${recipe.title}</h3>
                    <p>${recipe.description}</p>
                    <a href="#" class="read-more">View Recipe & Feedback <i class="fas fa-arrow-right"></i></a>
                </div>
            `;
            
            card.addEventListener('click', (e) => {
                e.preventDefault();
                openRecipeModal(recipe);
            });

            recipeGrid.appendChild(card);
        });
    };

    // Open Modal and display detailed recipe info
    const openRecipeModal = async (recipe) => {
        modalBody.innerHTML = '<h2>Loading...</h2>';
        modal.style.display = 'block';
        setTimeout(() => modal.classList.add('show'), 10);

        const ingredientsHtml = recipe.ingredients.map(ing => `<li><i class="fas fa-check-circle"></i> <span>${ing}</span></li>`).join('');
        const stepsHtml = recipe.steps.map((step, idx) => `
            <div class="step-card">
                <div class="step-number">${idx + 1}</div>
                <div class="step-content">${step}</div>
            </div>
        `).join('');

        // Fetch feedback for this recipe
        const feedbacksHtml = await getFeedbacksHtml(recipe.id);

        modalBody.innerHTML = `
            <div class="modal-hero" style="background-image: url('${recipe.image}')">
                <div class="modal-hero-overlay">
                    <h2>${recipe.title}</h2>
                    <p>${recipe.description}</p>
                </div>
            </div>
            
            <div class="modal-body-content">
                <div class="recipe-layout">
                    <div class="recipe-main">
                        <h3 class="modern-heading"><i class="fas fa-list-ol"></i> Step-by-Step Instructions</h3>
                        <div class="steps-container">
                            ${stepsHtml}
                        </div>
                    </div>
                    
                    <div class="recipe-sidebar">
                        <div class="ingredients-card">
                            <h3 class="modern-heading"><i class="fas fa-shopping-basket"></i> Ingredients</h3>
                            <ul class="ingredient-list">
                                ${ingredientsHtml}
                            </ul>
                        </div>
                    </div>
                </div>

                <div class="feedback-section modern-feedback">
                    <div class="feedback-header">
                        <h3 class="modern-heading"><i class="fas fa-star"></i> Diner Reviews</h3>
                    </div>
                    
                    <div class="feedback-grid">
                        <div class="feedback-form-wrapper">
                            <h4 style="margin-bottom:20px; color:var(--secondary-color);">Submit your review</h4>
                            <form class="feedback-form modern-form" id="form-feedback-${recipe.id}" onsubmit="submitFeedback(event, ${recipe.id})">
                                <div class="input-group">
                                    <label>Your Name</label>
                                    <input type="text" id="fb-user-${recipe.id}" placeholder="e.g. Rahul Sharma" required>
                                </div>
                                <div class="input-group">
                                    <label>Comments</label>
                                    <textarea id="fb-comment-${recipe.id}" rows="4" placeholder="How was the recipe? Did you add variations?" required></textarea>
                                </div>
                                <button type="submit" class="btn btn-primary full-width" style="padding:12px;">Publish Review</button>
                                <p id="fb-status-${recipe.id}" class="status-msg"></p>
                            </form>
                        </div>
                        
                        <div class="feedback-list-wrapper">
                            <h4 style="margin-bottom:20px; color:var(--secondary-color);">Recent Comments</h4>
                            <div class="feedback-list" id="feedback-list-${recipe.id}">
                                ${feedbacksHtml}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
    };

    // Close Modal
    closeBtn.addEventListener('click', () => {
        modal.classList.remove('show');
        setTimeout(() => modal.style.display = 'none', 300);
    });

    window.addEventListener('click', (e) => {
        if (e.target == modal) {
            modal.classList.remove('show');
            setTimeout(() => modal.style.display = 'none', 300);
        }
    });

    // Fetch feedback for a recipe
    const getFeedbacksHtml = async (recipeId) => {
        try {
            const response = await fetch(`/api/feedback/${recipeId}`);
            const feedbacks = await response.json();
            
            if (feedbacks.length === 0) {
                return '<p style="color:var(--light-text); font-style:italic;">No feedback yet. Be the first to share your thoughts!</p>';
            }

            return feedbacks.map(fb => `
                <div class="feedback-item">
                    <h4><i class="far fa-user-circle"></i> ${fb.user} <span class="date" style="margin-left:10px;">${new Date(fb.date).toLocaleDateString()}</span></h4>
                    <p style="margin-top:5px;">&quot;${fb.comment}&quot;</p>
                </div>
            `).join('');

        } catch (error) {
            return '<p>Could not load feedback.</p>';
        }
    };

    // Make submitFeedback globally available for the modal inline onsubmit
    window.submitFeedback = async (e, recipeId) => {
        e.preventDefault();
        
        const user = document.getElementById(`fb-user-${recipeId}`).value;
        const comment = document.getElementById(`fb-comment-${recipeId}`).value;
        const statusMsg = document.getElementById(`fb-status-${recipeId}`);
        const btn = e.target.querySelector('button');

        btn.disabled = true;
        btn.innerHTML = 'Posting...';

        try {
            const response = await fetch('/api/feedback', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ recipeId, user, comment })
            });

            if (response.ok) {
                statusMsg.style.color = '#28a745';
                statusMsg.textContent = 'Feedback posted successfully!';
                
                // Refresh feedback list
                const list = document.getElementById(`feedback-list-${recipeId}`);
                list.innerHTML = await getFeedbacksHtml(recipeId);
                
                // Clear form
                document.getElementById(`form-feedback-${recipeId}`).reset();
            } else {
                throw new Error('Failed to post feedback');
            }
        } catch (error) {
            statusMsg.style.color = '#dc3545';
            statusMsg.textContent = 'Error posting feedback. Please try again.';
        } finally {
            btn.disabled = false;
            btn.innerHTML = 'Post Feedback';
            setTimeout(() => statusMsg.textContent = '', 3000);
        }
    };

    // Contact Form Submit
    if (contactForm) {
        contactForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const name = document.getElementById('contact-name').value;
            const email = document.getElementById('contact-email').value;
            const message = document.getElementById('contact-message').value;
            const btn = contactForm.querySelector('button');

            btn.disabled = true;
            btn.innerHTML = 'Sending...';

            try {
                const response = await fetch('/api/contact', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ name, email, message })
                });

                if (response.ok) {
                    contactStatus.style.color = '#28a745';
                    contactStatus.textContent = 'Thank you! Your message has been sent.';
                    contactForm.reset();
                } else {
                    throw new Error('Failed to send message');
                }
            } catch (error) {
                contactStatus.style.color = '#dc3545';
                contactStatus.textContent = 'Error sending message. Please try again.';
            } finally {
                btn.disabled = false;
                btn.innerHTML = 'Send Message';
                setTimeout(() => contactStatus.textContent = '', 4000);
            }
        });
    }

    // Initialize
    fetchRecipes();
});

// Navbar background change on scroll
window.addEventListener('scroll', () => {
    const navbar = document.getElementById('navbar');
    if (window.scrollY > 50) {
        navbar.style.background = 'rgba(255, 255, 255, 0.95)';
        navbar.style.boxShadow = '0 2px 15px rgba(0,0,0,0.1)';
    } else {
        navbar.style.background = 'rgba(255, 255, 255, 0.9)';
        navbar.style.boxShadow = '0 2px 10px rgba(0,0,0,0.05)';
    }
});
