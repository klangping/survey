/**
 * 实用工具函数集合
 */

/**
 * 防抖函数
 * @param {Function} fn 需要防抖的函数
 * @param {number} delay 延迟时间(毫秒)
 * @param {boolean} immediate 是否立即执行
 * @return {Function} 返回防抖后的函数
 */
export function debounce(fn, delay = 500, immediate = false) {
  let timer = null;
  return function (...args) {
    if (timer) clearTimeout(timer);
    
    if (immediate && !timer) {
      fn.apply(this, args);
    }
    
    timer = setTimeout(() => {
      if (!immediate) {
        fn.apply(this, args);
      }
      timer = null;
    }, delay);
  };
}

/**
 * 节流函数
 * @param {Function} fn 需要节流的函数
 * @param {number} interval 执行间隔(毫秒)
 * @return {Function} 返回节流后的函数
 */
export function throttle(fn, interval = 500) {
  let lastTime = 0;
  return function (...args) {
    const now = Date.now();
    if (now - lastTime >= interval) {
      fn.apply(this, args);
      lastTime = now;
    }
  };
}

/**
 * 深度克隆对象
 * @param {Object} obj 要克隆的对象
 * @return {Object} 克隆后的新对象
 */
export function deepClone(obj) {
  if (obj === null || typeof obj !== 'object') return obj;
  
  const result = Array.isArray(obj) ? [] : {};
  for (const key in obj) {
    if (obj.hasOwnProperty(key)) {
      result[key] = deepClone(obj[key]);
    }
  }
  return result;
}

/**
 * 格式化日期时间
 * @param {Date|string|number} date 日期对象或可转换为日期的时间戳/字符串
 * @param {string} format 格式字符串，默认'YYYY-MM-DD'
 * @return {string} 格式化后的日期字符串
 */
export function formatDate(date, format = 'YYYY-MM-DD') {
  if (!date) return '';
  
  const d = new Date(date);
  if (isNaN(d.getTime())) return '';
  
  const padZero = num => (num < 10 ? `0${num}` : num);
  
  const replacements = {
    'YYYY': d.getFullYear(),
    'MM': padZero(d.getMonth() + 1),
    'DD': padZero(d.getDate()),
    'HH': padZero(d.getHours()),
    'mm': padZero(d.getMinutes()),
    'ss': padZero(d.getSeconds())
  };
  
  return format.replace(/YYYY|MM|DD|HH|mm|ss/g, match => replacements[match]);
}

/**
 * 生成随机字符串
 * @param {number} length 字符串长度，默认16
 * @return {string} 随机字符串
 */
export function randomString(length = 16) {
  const chars = 'ABCDEFGHJKMNPQRSTWXYZabcdefhijkmnprstwxyz2345678';
  const maxPos = chars.length;
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * maxPos));
  }
  return result;
}

/**
 * 手机号脱敏处理
 * @param {string} phone 手机号码
 * @return {string} 脱敏后的手机号
 */
export function maskPhone(phone) {
  if (!phone || typeof phone !== 'string') return '';
  return phone.replace(/(\d{3})\d{4}(\d{4})/, '$1****$2');
}

/**
 * 验证手机号格式
 * @param {string} phone 手机号码
 * @return {boolean} 是否有效
 */
export function validatePhone(phone) {
  return /^1[3-9]\d{9}$/.test(phone);
}

/**
 * 验证邮箱格式
 * @param {string} email 邮箱地址
 * @return {boolean} 是否有效
 */
export function validateEmail(email) {
  return /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(email);
}

/**
 * 判断是否为空值
 * @param {*} value 要检查的值
 * @return {boolean} 是否为空
 */
export function isEmpty(value) {
  if (value === null || value === undefined) return true;
  if (typeof value === 'string' && value.trim() === '') return true;
  if (Array.isArray(value) && value.length === 0) return true;
  if (typeof value === 'object' && Object.keys(value).length === 0) return true;
  return false;
}

/**
 * 金额格式化（分转元）
 * @param {number} cents 金额（分）
 * @param {number} decimals 保留小数位，默认2
 * @return {string} 格式化后的金额字符串
 */
export function formatMoney(cents, decimals = 2) {
  const yuan = Number(cents) / 100;
  return yuan.toFixed(decimals).replace(/\B(?=(\d{3})+(?!\d))/g, ',');
}

/**
 * 获取URL参数
 * @param {string} name 参数名
 * @param {string} url URL字符串，默认使用当前页面URL
 * @return {string|null} 参数值
 */
export function getQueryParam(name, url = window.location.href) {
  name = name.replace(/[\[\]]/g, '\\$&');
  const regex = new RegExp('[?&]' + name + '(=([^&#]*)|&|#|$)');
  const results = regex.exec(url);
  if (!results) return null;
  if (!results[2]) return '';
  return decodeURIComponent(results[2].replace(/\+/g, ' '));
}

/**
 * 对象转URL查询字符串
 * @param {Object} params 参数对象
 * @return {string} 查询字符串
 */
export function objectToQueryString(params) {
  return Object.keys(params)
    .map(key => `${encodeURIComponent(key)}=${encodeURIComponent(params[key])}`)
    .join('&');
}

/**
 * 休眠函数
 * @param {number} ms 毫秒数
 * @return {Promise} Promise对象
 */
export function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * 复制文本到剪贴板
 * @param {string} text 要复制的文本
 * @return {Promise} 返回Promise
 */
export function copyToClipboard(text) {
  return new Promise((resolve, reject) => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(text).then(resolve).catch(reject);
    } else {
      const textarea = document.createElement('textarea');
      textarea.value = text;
      textarea.style.position = 'fixed';
      document.body.appendChild(textarea);
      textarea.select();
      try {
        document.execCommand('copy');
        resolve();
      } catch (err) {
        reject(err);
      }
      document.body.removeChild(textarea);
    }
  });
}

/**
 * 生成UUID
 * @return {string} UUID字符串
 */
export function generateUUID() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

/**
 * 数字千分位格式化
 * @param {number} num 数字
 * @return {string} 格式化后的字符串
 */
export function thousandSeparator(num) {
  if (typeof num !== 'number') return num;
  return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
}

export default {
  debounce,
  throttle,
  deepClone,
  formatDate,
  randomString,
  maskPhone,
  validatePhone,
  validateEmail,
  isEmpty,
  formatMoney,
  getQueryParam,
  objectToQueryString,
  sleep,
  copyToClipboard,
  generateUUID,
  thousandSeparator
};