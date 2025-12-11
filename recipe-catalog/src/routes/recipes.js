const express = require('express');
const router = express.Router();
const {
  getAllRecipes,
  getRecipeById,
  createRecipe,
  updateRecipe,
  deleteRecipe,
  getCategories,
  searchRecipes
} = require('../controllers/recipesController');

// GET /api/recipes - Получить все рецепты (с фильтрацией)
router.get('/', getAllRecipes);

// GET /api/recipes/categories - Получить все категории
router.get('/categories', getCategories);

// GET /api/recipes/search - Поиск рецептов
router.get('/search', searchRecipes);

// GET /api/recipes/:id - Получить рецепт по ID
router.get('/:id', getRecipeById);

// POST /api/recipes - Создать новый рецепт
router.post('/', createRecipe);

// PUT /api/recipes/:id - Обновить рецепт
router.put('/:id', updateRecipe);

// DELETE /api/recipes/:id - Удалить рецепт
router.delete('/:id', deleteRecipe);

module.exports = router;