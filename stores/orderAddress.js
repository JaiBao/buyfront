// orderAddress.js
import { defineStore } from 'pinia'

export const useOrderAddress = defineStore('main', {
  state: () => ({
    addressoptions: [
      { id: 1, name: '基隆市' },
      { id: 2, name: '臺北市' },
      { id: 3, name: '新北市' },
      { id: 4, name: '桃園市' }
    ],
    cityOptions: ref([]),
    citiesByAddress: {
      1: [
        {
          city_id: 23,
          name: '仁愛區'
        },
        {
          city_id: 24,
          name: '信義區'
        },
        {
          city_id: 25,
          name: '中正區'
        },
        {
          city_id: 26,
          name: '中山區'
        },
        {
          city_id: 27,
          name: '安樂區'
        },
        {
          city_id: 28,
          name: '暖暖區'
        },
        {
          city_id: 29,
          name: '七堵區'
        }
      ],
      2: [
        {
          city_id: 30,
          name: '中正區'
        },
        {
          city_id: 31,
          name: '大同區'
        },
        {
          city_id: 32,
          name: '中山區'
        },
        {
          city_id: 33,
          name: '松山區'
        },
        {
          city_id: 34,
          name: '大安區'
        },
        {
          city_id: 35,
          name: '萬華區'
        },
        {
          city_id: 36,
          name: '信義區'
        },
        {
          city_id: 37,
          name: '士林區'
        },
        {
          city_id: 38,
          name: '北投區'
        },
        {
          city_id: 39,
          name: '內湖區'
        },
        {
          city_id: 40,
          name: '南港區'
        },
        {
          city_id: 41,
          name: '文山區'
        }
      ],
      3: [
        {
          city_id: 42,
          name: '萬里區'
        },
        {
          city_id: 43,
          name: '金山區'
        },
        {
          city_id: 44,
          name: '板橋區'
        },
        {
          city_id: 45,
          name: '汐止區'
        },
        {
          city_id: 46,
          name: '深坑區'
        },
        {
          city_id: 47,
          name: '石碇區'
        },
        {
          city_id: 48,
          name: '瑞芳區'
        },
        {
          city_id: 49,
          name: '平溪區'
        },
        {
          city_id: 50,
          name: '雙溪區'
        },
        {
          city_id: 51,
          name: '貢寮區'
        },
        {
          city_id: 52,
          name: '新店區'
        },
        {
          city_id: 53,
          name: '坪林區'
        },
        {
          city_id: 54,
          name: '烏來區'
        },
        {
          city_id: 55,
          name: '永和區'
        },
        {
          city_id: 56,
          name: '中和區'
        },
        {
          city_id: 57,
          name: '土城區'
        },
        {
          city_id: 58,
          name: '三峽區'
        },
        {
          city_id: 59,
          name: '樹林區'
        },
        {
          city_id: 60,
          name: '鶯歌區'
        },
        {
          city_id: 61,
          name: '三重區'
        },
        {
          city_id: 62,
          name: '新莊區'
        },
        {
          city_id: 63,
          name: '泰山區'
        },
        {
          city_id: 64,
          name: '林口區'
        },
        {
          city_id: 65,
          name: '蘆洲區'
        },
        {
          city_id: 66,
          name: '五股區'
        },
        {
          city_id: 67,
          name: '八里區'
        },
        {
          city_id: 68,
          name: '淡水區'
        },
        {
          city_id: 69,
          name: '三芝區'
        },
        {
          city_id: 70,
          name: '石門區'
        }
      ],
      4: [
        {
          city_id: 71,
          name: '中壢區'
        },
        {
          city_id: 72,
          name: '平鎮區'
        },
        {
          city_id: 73,
          name: '龍潭區'
        },
        {
          city_id: 74,
          name: '楊梅區'
        },
        {
          city_id: 75,
          name: '新屋區'
        },
        {
          city_id: 76,
          name: '觀音區'
        },
        {
          city_id: 77,
          name: '桃園區'
        },
        {
          city_id: 78,
          name: '龜山區'
        },
        {
          city_id: 79,
          name: '八德區'
        },
        {
          city_id: 80,
          name: '大溪區'
        },
        {
          city_id: 81,
          name: '復興區'
        },
        {
          city_id: 82,
          name: '大園區'
        },
        {
          city_id: 83,
          name: '蘆竹區'
        }
      ]
    }
  }),
  actions: {
    updateCityOptions(addressId) {
      console.log('Selected Address ID:', addressId)
      this.cityOptions.value = this.citiesByAddress[addressId] || []
      console.log('Updated City Options:', this.cityOptions)
    }
  }
})
