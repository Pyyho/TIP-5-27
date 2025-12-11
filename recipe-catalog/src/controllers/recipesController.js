const fs = require('fs');
const path = require('path');

const dataPath = path.join(__dirname, '../../data/recipes.json');

// Инициализация файла с данными если его нет
if (!fs.existsSync(dataPath)) {
  const initialData = {
    recipes: [
      {
        id: 1,
        title: "Спагетти Карбонара",
        category: "Паста",
        prepTime: 30,
        ingredients: ["спагетти", "бекон", "яйца", "пармезан", "черный перец"],
        instructions: "1. Приготовить пасту...",
        difficulty: "Средняя",
        rating: 4.8
      },
      {
        id: 2,
        title: "Омлет с овощами",
        category: "Завтрак",
        prepTime: 15,
        ingredients: ["яйца", "помидоры", "лук", "перец", "соль"],
        instructions: "1. Нарезать овощи...",
        difficulty: "Легкая",
        rating: 4.5
      }
    ]
  };
  fs.writeFileSync(dataPath, JSON.stringify(initialData, null, 2));
}

// Чтение рецептов
const readRecipes = () => {
  try {
    const data = fs.readFileSync(dataPath, 'utf8');
    return JSON.parse(data).recipes;
  } catch (error) {
    return [];
  }
};

// Запись рецептов
const writeRecipes = (recipes) => {
  const data = { recipes };
  fs.writeFileSync(dataPath, JSON.stringify(data, null, 2));
};

// Получить все рецепты
const getAllRecipes = (req, res) => {
  try {
    const { category, difficulty, minRating, maxTime } = req.query;
    let recipes = readRecipes();
    
    // Фильтрация по query-параметрам
    if (category) {
      recipes = recipes.filter(recipe => 
        recipe.category.toLowerCase() === category.toLowerCase()
      );
    }
    
    if (difficulty) {
      recipes = recipes.filter(recipe => 
        recipe.difficulty.toLowerCase() === difficulty.toLowerCase()
      );
    }
    
    if (minRating) {
      recipes = recipes.filter(recipe => 
        recipe.rating >= parseFloat(minRating)
      );
    }
    
    if (maxTime) {
      recipes = recipes.filter(recipe => 
        recipe.prepTime <= parseInt(maxTime)
      );
    }
    
    res.json(recipes);
  } catch (error) {
    res.status(500).json({ error: 'Ошибка при получении рецептов' });
  }
};

// Получить рецепт по ID
const getRecipeById = (req, res) => {
  try {
    const { id } = req.params;
    const recipes = readRecipes();
    const recipe = recipes.find(r => r.id === parseInt(id));
    
    if (!recipe) {
      return res.status(404).json({ error: 'Рецепт не найден' });
    }
    
    res.json(recipe);
  } catch (error) {
    res.status(500).json({ error: 'Ошибка при получении рецепта' });
  }
};

// Создать новый рецепт
const createRecipe = (req, res) => {
  try {
    const recipes = readRecipes();
    
    const newRecipe = {
      id: recipes.length > 0 ? Math.max(...recipes.map(r => r.id)) + 1 : 1,
      title: req.body.title,
      category: req.body.category,
      prepTime: req.body.prepTime,
      ingredients: req.body.ingredients || [],
      instructions: req.body.instructions,
      difficulty: req.body.difficulty,
      rating: req.body.rating || 0,
      createdAt: new Date().toISOString()
    };
    
    // Валидация
    if (!newRecipe.title || !newRecipe.category) {
      return res.status(400).json({ error: 'Название и категория обязательны' });
    }
    
    recipes.push(newRecipe);
    writeRecipes(recipes);
    
    res.status(201).json(newRecipe);
  } catch (error) {
    res.status(500).json({ error: 'Ошибка при создании рецепта' });
  }
};

// Обновить рецепт
const updateRecipe = (req, res) => {
  try {
    const { id } = req.params;
    const recipes = readRecipes();
    const recipeIndex = recipes.findIndex(r => r.id === parseInt(id));
    
    if (recipeIndex === -1) {
      return res.status(404).json({ error: 'Рецепт не найден' });
    }
    
    const updatedRecipe = {
      ...recipes[recipeIndex],
      ...req.body,
      id: parseInt(id), // Не позволяем изменить ID
      updatedAt: new Date().toISOString()
    };
    
    recipes[recipeIndex] = updatedRecipe;
    writeRecipes(recipes);
    
    res.json(updatedRecipe);
  } catch (error) {
    res.status(500).json({ error: 'Ошибка при обновлении рецепта' });
  }
};

// Удалить рецепт
const deleteRecipe = (req, res) => {
  try {
    const { id } = req.params;
    let recipes = readRecipes();
    const recipeIndex = recipes.findIndex(r => r.id === parseInt(id));
    
    if (recipeIndex === -1) {
      return res.status(404).json({ error: 'Рецепт не найден' });
    }
    
    const deletedRecipe = recipes[recipeIndex];
    recipes = recipes.filter(r => r.id !== parseInt(id));
    writeRecipes(recipes);
    
    res.json({ 
      message: 'Рецепт успешно удален',
      recipe: deletedRecipe 
    });
  } catch (error) {
    res.status(500).json({ error: 'Ошибка при удалении рецепта' });
  }
};

// Получить категории
const getCategories = (req, res) => {
  try {
    const recipes = readRecipes();
    const categories = [...new Set(recipes.map(recipe => recipe.category))];
    res.json(categories);
  } catch (error) {
    res.status(500).json({ error: 'Ошибка при получении категорий' });
  }
};

// Поиск рецептов
const searchRecipes = (req, res) => {
  try {
    const { q } = req.query;
    
    if (!q) {
      return res.status(400).json({ error: 'Параметр поиска обязателен' });
    }
    
    const recipes = readRecipes();
    const searchTerm = q.toLowerCase();
    
    const results = recipes.filter(recipe => 
      recipe.title.toLowerCase().includes(searchTerm) ||
      recipe.ingredients.some(ingredient => 
        ingredient.toLowerCase().includes(searchTerm)
      )
    );
    
    res.json(results);
  } catch (error) {
    res.status(500).json({ error: 'Ошибка при поиске рецептов' });
  }
};

module.exports = {
  getAllRecipes,
  getRecipeById,
  createRecipe,
  updateRecipe,
  deleteRecipe,
  getCategories,
  searchRecipes
};