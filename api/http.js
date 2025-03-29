const baseURL = process.env.NODE_ENV === 'development' ?
	'http://localhost:3000/api' :
	'https://your-production-domain.com/api';
const request = (options) => {
	return new Promise((resolve, reject) => {
		const token = uni.getStorageSync('token');
		const headers = {
			'Content-Type': 'application/json',
			...options.headers
		};

		if (token) {
			headers['Authorization'] = `Bearer ${token}`;
		}

		let url = baseURL + options.url;

		// 处理GET请求参数
		if (options.method === 'GET' && options.data) {
			const params = new URLSearchParams();
			for (const key in options.data) {
				if (options.data[key] !== undefined) {
					params.append(key, options.data[key]);;
				}
			}
			 url += `?${params.toString()}`;
			}
		}

		// 设置超时时间
		const timeout = options.timeout || 10000;
		let timeoutTimer = setTimeout(() => {
			reject({
				error: '请求超时',
				details: `请求超过${timeout}ms未响应`
			});
		}, timeout);

		uni.request({
			url,
			method: options.method || 'GET',
			data: options.method !== 'GET' ? options.data : undefined,
			header: headers,
			success: (res) => {
				clearTimeout(timeoutTimer);

				// 处理401未授权
				if (res.statusCode === 401) {
					uni.removeStorageSync('token');
					uni.removeStorageSync('user');
					uni.showToast({
						title: '登录已过期，请重新登录',
						icon: 'none'
					});
					setTimeout(() => {
						uni.reLaunch({
							url: '/pages/auth/login'
						});
					}, 1500);
					return;
				}

				if (res.statusCode >= 200 && res.statusCode < 300) {
					resolve(res.data);
				} else {
					reject(res.data || {
						error: `请求失败: ${res.statusCode}`,
						message: res.data?.message || '请求失败'
					});
				}
			},
			fail: (err) => {
				clearTimeout(timeoutTimer);
				reject({
					error: '网络错误',
					details: err.errMsg || err
				});
			}
		});
	});
};

const http = {
	get(url, params, options = {}) {
		return request({
			url,
			method: 'GET',
			data: params,
			...options
		});
	},
	post(url, data, options = {}) {
		return request({
			url,
			method: 'POST',
			data,
			...options
		});
	},
	put(url, data, options = {}) {
		return request({
			url,
			method: 'PUT',
			data,
			...options
		});
	},
	delete(url, options = {}) {
		return request({
			url,
			method: 'DELETE',
			...options
		});
	}
};

export default http;