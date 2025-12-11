const API_BASE_URL = '/api/recipes';

// DOM элементы
const recipesContainer = document.getElementById('recipesContainer');
const recipeForm = document.getElementById('recipeForm');
const editForm = document.getElementById('editForm');
const searchInput = document.getElementById('searchInput');
const categoryFilter = document.getElementById('categoryFilter');
const difficultyFilter = document.getElementById('difficultyFilter');
const ratingFilter = document.getElementById('ratingFilter');
const modal = document.getElementById('modal');
const closeModal = document.querySelector('.close');

// Загрузить все рецепты
async function loadRecipes() {
    try {
        const params = new URLSearchParams();
        
        if (categoryFilter.value) params.append('category', categoryFilter.value);
        if (difficultyFilter.value) params.append('difficulty', difficultyFilter.value);
        if (ratingFilter.value) params.append('minRating', ratingFilter.value);
        
        const url = `${API_BASE_URL}?${params.toString()}`;
        const response = await fetch(url);
        const recipes = await response.json();
        
        displayRecipes(recipes);
    } catch (error) {
        console.error('Ошибка при загрузке рецептов:', error);
        recipesContainer.innerHTML = '<p class="error">Ошибка при загрузке рецептов</p>';
    }
}

// Загрузить категории
async function loadCategories() {
    try {
        const response = await fetch(`${API_BASE_URL}/categories`);
        const categories = await response.json();
        
        categoryFilter.innerHTML = '<option value="">Все категории</option>';
        categories.forEach(category => {
            const option = document.createElement('option');
            option.value = category;
            option.textContent = category;
            categoryFilter.appendChild(option);
        });
    } catch (error) {
        console.error('Ошибка при загрузке категорий:', error);
    }
}

// Отобразить рецепты
function displayRecipes(recipes) {
    if (recipes.length === 0) {
        recipesContainer.innerHTML = '<p class="no-recipes">Рецепты не найдены</p>';
        return;
    }
    
    recipesContainer.innerHTML = recipes.map(recipe => `
        <div class="recipe-card">
            <h3>${recipe.title}</h3>
            <div class="recipe-meta">
                <span class="recipe-category">${recipe.category}</span>
                <span class="recipe-time">${recipe.prepTime} мин</span>
                <span class="recipe-difficulty difficulty-${getDifficultyClass(recipe.difficulty)}">
                    ${recipe.difficulty}
                </span>
            </div>
            <div class="recipe-rating">
                Рейтинг: ⭐ ${recipe.rating}/5
            </div>
            <div class="recipe-ingredients">
                <strong>Ингредиенты:</strong>
                <p>${recipe.ingredients.slice(0, 3).join(', ')}${recipe.ingredients.length > 3 ? '...' : ''}</p>
            </div>
            <div class="recipe-actions">
                <button class="edit-btn" onclick="editRecipe(${recipe.id})">Редактировать</button>
                <button class="delete-btn" onclick="deleteRecipe(${recipe.id})">Удалить</button>
            </div>
        </div>
    `).join('');
}

// Получить класс сложности
function getDifficultyClass(difficulty) {
    const map = {
        'Легкая': 'easy',
        'Средняя': 'medium',
        'Сложная': 'hard'
    };
    return map[difficulty] || 'medium';
}

// Добавить новый рецепт
recipeForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const recipe = {
        title: document.getElementById('title').value,
        category: document.getElementById('category').value,
        prepTime: parseInt(document.getElementById('prepTime').value),
        ingredients: document.getElementById('ingredients').value.split(',').map(i => i.trim()),
        instructions: document.getElementById('instructions').value,
        difficulty: document.getElementById('difficulty').value,
        rating: parseFloat(document.getElementById('rating').value) || 0
    };
    
    try {
        const response = await fetch(API_BASE_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(recipe)
        });
        
        if (response.ok) {
            const newRecipe = await response.json();
            alert(`Рецепт "${newRecipe.title}" успешно добавлен!`);
            recipeForm.reset();
            loadRecipes();
            loadCategories();
        } else {
            const error = await response.json();
            alert(`Ошибка: ${error.error}`);
        }
    } catch (error) {
        console.error('Ошибка при добавлении рецепта:', error);
        alert('Ошибка при добавлении рецепта');
    }
});

// Поиск рецептов
searchInput.addEventListener('input', debounce(async () => {
    const query = searchInput.value.trim();
    
    if (query.length < 2 && query.length > 0) return;
    
    try {
        const url = query.length >= 2 
            ? `${API_BASE_URL}/search?q=${encodeURIComponent(query)}`
            : API_BASE_URL;
        
        const response = await fetch(url);
        const recipes = await response.json();
        displayRecipes(recipes);
    } catch (error) {
        console.error('Ошибка при поиске:', error);
    }
}, 500));

// Редактировать рецепт
async function editRecipe(id) {
    try {
        const response = await fetch(`${API_BASE_URL}/${id}`);
        const recipe = await response.json();
        
        document.getElementById('editId').value = recipe.id;
        document.getElementById('editTitle').value = recipe.title;
        document.getElementById('editCategory').value = recipe.category;
        document.getElementById('editPrepTime').value = recipe.prepTime;
        document.getElementById('editIngredients').value = recipe.ingredients.join(', ');
        document.getElementById('editInstructions').value = recipe.instructions;
        document.getElementById('editDifficulty').value = recipe.difficulty;
        document.getElementById('editRating').value = recipe.rating;
        
        modal.style.display = 'block';
    } catch (error) {
        console.error('Ошибка при загрузке рецепта:', error);
        alert('Ошибка при загрузке рецепта для редактирования');
    }
}

// Сохранить изменения
editForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const id = document.getElementById('editId').value;
    const recipe = {
        title: document.getElementById('editTitle').value,
        category: document.getElementById('editCategory').value,
        prepTime: parseInt(document.getElementById('editPrepTime').value),
        ingredients: document.getElementById('editIngredients').value.split(',').map(i => i.trim()),
        instructions: document.getElementById('editInstructions').value,
        difficulty: document.getElementById('editDifficulty').value,
        rating: parseFloat(document.getElementById('editRating').value) || 0
    };
    
    try {
        const response = await fetch(`${API_BASE_URL}/${id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(recipe)
        });
        
        if (response.ok) {
            const updatedRecipe = await response.json();
            alert(`Рецепт "${updatedRecipe.title}" успешно обновлен!`);
            modal.style.display = 'none';
            loadRecipes();
            loadCategories();
        } else {
            const error = await response.json();
            alert(`Ошибка: ${error.error}`);
        }
    } catch (error) {
        console.error('Ошибка при обновлении рецепта:', error);
        alert('Ошибка при обновлении рецепта');
    }
});

// Удалить рецепт
async function deleteRecipe(id) {
    if (!confirm('Вы уверены, что хотите удалить этот рецепт?')) {
        return;
    }
    
    try {
        const response = await fetch(`${API_BASE_URL}/${id}`, {
            method: 'DELETE'
        });
        
        if (response.ok) {
            const result = await response.json();
            alert(result.message);
            loadRecipes();
            loadCategories();
        } else {
            const error = await response.json();
            alert(`Ошибка: ${error.error}`);
        }
    } catch (error) {
        console.error('Ошибка при удалении рецепта:', error);
        alert('Ошибка при удалении рецепта');
    }
}

// Дебаунс для поиска
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// Закрыть модальное окно
closeModal.addEventListener('click', () => {
    modal.style.display = 'none';
});

window.addEventListener('click', (e) => {
    if (e.target === modal) {
        modal.style.display = 'none';
    }
});

// Инициализация
document.addEventListener('DOMContentLoaded', () => {
    loadRecipes();
    loadCategories();
    
    // Загрузить рецепты при изменении фильтров
    [difficultyFilter, categoryFilter, ratingFilter].forEach(filter => {
        filter.addEventListener('change', loadRecipes);
    });
});