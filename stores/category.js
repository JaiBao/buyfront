// stores/category.js
import { defineStore } from 'pinia'

export const useCategoryStore = defineStore('category', {
  state: () => ({
    categories: ['中式料理', '韓式料理', '日式料理', '手搖杯飲料', '台式料理', '甜品點心', '其他']
  }),
  actions: {
    addCategory(category) {
      if (!this.categories.includes(category)) {
        this.categories.push(category)
      }
    },
    removeCategory(category) {
      this.categories = this.categories.filter(cat => cat !== category)
    }
  }
})
