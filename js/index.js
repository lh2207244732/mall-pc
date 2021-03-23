(function (w, d) {
    var pag = {
        init: function () {
            this.cartCount = document.querySelector('.cart-count')
            this.cartBox = document.querySelector('.cart-box')
            this.cartContent = document.querySelector('.cart-content')
            this.searchBtn = document.querySelector('.search-btn')
            this.searchInput = document.querySelector('.search-input')
            this.searchLayer = document.querySelector('.search-layer')
            this.categories = d.querySelector('.categories')
            this.parentCategories = document.querySelector('.parent-categories')
            this.childCategories = d.querySelector('.child-categories')

            this.searchTimer = null
            this.categoriesTimer = null
            this.isSearchLayerEmpty = true
            this.parentCategoriesItem = null
            this.parentCategoriesItem = null
            this.lastActiveIndex = 0
            this.handleCart()
            this.handleSearch()
            this.handleCategories()

        },
        loadCartCount: function () {
            var _this = this
            utils.ajax({
                method: "get",
                url: '/carts/count',
                success: function (data) {
                    _this.cartCount.innerHTML = data.data
                }
            })
        },
        handleCart: function () {
            var _this = this
            this.loadCartCount()
            // 显示下拉购物车
            this.cartBox.addEventListener('mouseenter', function () {
                utils.show(_this.cartContent)
                // 显示loading状态
                _this.cartContent.innerHTML = '<div class="loader"></div>'
                //发送ajax请求
                utils.ajax({
                    method: 'get',
                    url: '/carts',
                    success: function (data) {
                        if (data.code == 0) {
                            _this.renderCart(data.data.cartList)
                        } else {
                            _this.cartContent.innerHTML = '<span class="empty-cart">获取购物车失败,请重试</span>'
                        }
                    },
                    error: function (status) {
                        _this.cartContent.innerHTML = '<span class="empty-cart">获取购物车失败,请重试</span>'
                    }
                })
            }, false)
            // 隐藏下拉购物车
            this.cartBox.addEventListener('mouseleave', function () {
                utils.hide(_this.cartContent)
            }, false)
        },
        renderCart: function (list) {
            var len = list.length
            if (len > 0) {
                var html = ''
                html += '<span class="cart-tip">最近加入的宝贝</span>'
                html += '<ul>'
                for (var i = 0; i < len; i++) {
                    html += '<li class="cart-item clearfix">'
                    html += '   <a href="#" target="_blank">'
                    html += '       <img src="' + list[i].product.mainImage + '" alt="">'
                    html += '       <span class="text-ellipsis">' + list[i].product.name + '</span>'
                    html += '   </a>'
                    html += '   <span class="product-count">x ' + list[i].count + ' </span><span class="product-price">' + list[i].product.price + '</span>'
                    html += '</li>'
                }
                html += '</ul>'
                html += '<span class="line"></span>'
                html += '<a href="/cart.html" class="btn cart-btn">查看我的购物车</a>'
                this.cartContent.innerHTML = html
            } else {
                this.cartContent.innerHTML = '<span class="empty-cart">购物车中还没有商品,赶紧来购买吧!</span>'
            }
        },
        handleSearch: function () {
            var _this = this
            // 提交搜索
            this.searchBtn.addEventListener('click', function () {
                _this.submitSearch()
            }, false)
            //自动提示
            this.searchInput.addEventListener('input', function () {
                if (_this.searchTimer) {
                    clearTimeout(_this.searchTimer)
                }
                _this.searchTimer = setTimeout(function () {
                    _this.getSearchData()
                }, 200)

            }, false)
            //点击其他地方隐藏提示框
            d.addEventListener('click', function () {
                utils.hide(_this.searchLayer)
            }, false)
            // 获取焦点显示
            this.searchInput.addEventListener('focus', function () {
                if (!_this.isSearchLayerEmpty) {
                    utils.show(_this.searchLayer)
                }
            }, false)
            //阻止输入框冒泡到document
            this.searchInput.addEventListener('click', function (event) {
                event.stopPropagation()
            }, false)
            //用事件代理处理动态提示层的提交
            this.searchLayer.addEventListener('click', function (ev) {
                var elem = ev.target
                if (elem.className == 'search-item') {
                    var keyword = elem.innerText
                    _this.searchInput.value = keyword
                    _this.submitSearch()
                }
            }, false)
        },
        submitSearch: function () {
            var keyword = this.searchInput.value
            w.location.href = './list.html?keyword=' + keyword
        },
        getSearchData: function () {
            var keyword = this.searchInput.value
            var _this = this
            if (!keyword) {
                this.appendSearchLayerHTML('')
                return
            }
            utils.ajax({
                method: "get",
                url: '/products/search',
                data: {
                    keyword: keyword
                },
                success: function (data) {
                    if (data.code == 0) {
                        _this.renderSearchLayer(data.data)
                    }
                },
                error: function (status) {
                    console.log('获取出错啦')
                }
            })
        },
        renderSearchLayer: function (list) {
            var len = list.length
            var html = ''
            if (len > 0) {
                for (var i = 0; i < len; i++) {
                    html += '<li class="search-item">' + list[i].name + '</li>'
                }
            }
            this.appendSearchLayerHTML(html)
        },
        appendSearchLayerHTML: function (html) {
            if (html) {
                utils.show(this.searchLayer)
                this.searchLayer.innerHTML = html
                this.isSearchLayerEmpty = true
            } else {
                utils.hide(this.searchLayer)
                this.searchLayer.innerHTML = html
                this.isSearchLayerEmpty = false
            }
        },
        handleCategories: function () {
            var _this = this
            // 获取父级分类
            this.getParentCategoriesData()
            // 用事件代理的方式处理父级分类项目的切换
            this.categories.addEventListener('mouseover', function (event) {
                if (!_this.parentCategoriesItem) {
                    return
                }
                if (_this.categoriesTimer) {
                    clearTimeout(_this.categoriesTimer)
                }
                _this.categoriesTimer = setTimeout(function () {
                    var elem = event.target
                    if (elem.className == 'parent-categories-item') {
                        utils.show(_this.childCategories)
                        var pid = elem.getAttribute('data-id')
                        var index = elem.getAttribute('data-index')
                        _this.getChildCategoriesData(pid)
                        _this.parentCategoriesItem[_this.lastActiveIndex].className = 'parent-categories-item'
                        _this.parentCategoriesItem[index].className = 'parent-categories-item active'
                        _this.lastActiveIndex = index
                    }
                }, 100)
            }, false)
            this.categories.addEventListener('mouseleave', function (event) {
                if (!_this.parentCategoriesItem) {
                    return
                }
                if (_this.categoriesTimer) {
                    clearTimeout(_this.categoriesTimer)
                }
                utils.hide(_this.childCategories)
                _this.childCategories.innerHTML = ''
                _this.parentCategoriesItem[_this.lastActiveIndex].className = 'parent-categories-item'
            }, false)
        },
        getParentCategoriesData: function () {
            var _this = this
            utils.ajax({
                method: 'get',
                url: '/categories/arrayCategories',
                success: function (data) {
                    if (data.code == 0) {
                        _this.renderParentCategories(data.data)
                    }
                },
                error: function (status) {
                    console.log(status)
                }
            })
        },
        getChildCategoriesData: function (pid) {
            var _this = this
            this.childCategories.innerHTML = '<div class="loader"></div>'
            utils.ajax({
                method: 'get',
                url: '/categories/childArrayCategories',
                data: {
                    pid: pid
                },
                success: function (data) {
                    console.log(data)
                    if (data.code == 0) {
                        _this.renderChildCategories(data.data)
                    }
                },
                error: function (status) {
                    console.length(status)
                }
            })
        },
        renderParentCategories: function (list) {
            var len = list.length
            if (len > 0) {
                var html = '<ul>'
                for (var i = 0; i < len; i++) {
                    html += ' <li class="parent-categories-item" data-id="' + list[i]._id + '" data-index="' + i + '" >' + list[i].name + '</li>'
                }
                html += '</ul>'
                this.parentCategories.innerHTML = html
            }
            this.parentCategoriesItem = d.querySelectorAll('.parent-categories-item')
        },
        renderChildCategories: function (list) {
            var len = list.length
            if (len > 0) {
                var html = '<ul>'
                for (var i = 0; i < len; i++) {
                    html += ` <li class="child-item">
                    <a href="#">
                        <img src="${list[i].icon}" alt="">
                        <p>${list[i].name}</p>
                    </a>
                </li>`
                }
                html += '</ul>'
                this.childCategories.innerHTML = html
            }
        }
    }
    pag.init()
})(window, document);