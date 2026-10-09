fetch("works.csv")
    .then(function(response) {
        return response.text();
    })
    .then(function(data) {

        // CSVを行ごとに分割
        var rows = data.trim().split("\n");

        //1行目は見出し
        var headers = rows[0].split(",");

        // 2行目以降を作品データにする
        var works = rows.slice(1).map(function(row) {

            var values = row.split(",");

            var work = {};

            headers.forEach(function(header, index) {
                work[header] = values[index];
            });

            return work;
        });

        // HTML要素を取得
        var grid = document.getElementById("works-grid");

        var categorySelect = document.getElementById("category");

        var sortSelect = document.getElementById("sort");

        // カテゴリ一覧を作る
        var categories = [];

        works.forEach(function(work) {
            //まだ追加してないカテゴリならリストに追加
            if (!categories.includes(work.category)) {
                categories.push(work.category);
            }
        });

        //swelect要素にカテゴリを追加しwebページに表示させる
        categories.forEach(function(category) {
            var option = document.createElement("option");
            option.value = category;
            option.textContent = category;
            categorySelect.appendChild(option);
        });

        //作品を表示する関数
        function displayWorks() {
            //選択されたカテゴリを取得
            var selectedCategory = categorySelect.value;

            //選択されたソート順を取得
            var selectedSort = sortSelect.value;

            //元のworksをコピー
            var filteredWorks = works.slice();

            //カテゴリ絞り込み
            if (selectedCategory !== "all") {
                filteredWorks = filteredWorks.filter(function(work) {
                    return work.category === selectedCategory;
                });
            }

            //ソート
            if (selectedSort === "new") {
                filteredWorks.sort(function(a, b) {
                    return Number(b.year) - Number(a.year);
                });
            }
            else if (selectedSort === "old") {
                filteredWorks.sort(function(a, b) {
                    return Number(a.year) - Number(b.year);
                });
            }
            else if (selectedSort === "title") {
                filteredWorks.sort(function(a, b) {
                    return a.title.localeCompare(b.title,"ja");
                });
            }

             //画面を一度空にする
             grid.innerHTML = "";

             //作品を1つずつ表示
             filteredWorks.forEach(function(work) {

                var card = document.createElement("article");

                card.className = "work-card";

                card.innerHTML =
                    '<a href="' + work.link + '">' +
                        '<img src="' + work.image + '" alt="' + work.title + '">' +
                        '<div class="work-info">' +
                            '<p class="work-category">' + work.category + '</p>' +
                            '<h4>' + work.title + '</h4>' +
                            '<p>' + work.description + '</p>' +
                            '<p class="work-year">' + work.year + '</p>' +
                        '</div>' +
                    '</a>';      
                grid.appendChild(card);
            });
        }

        //最初に表示
        displayWorks();

        //カテゴリ変更時
        categorySelect.addEventListener("change", function() {
            displayWorks();
        });

        //ソート変更時
        sortSelect.addEventListener("change", function() {
            displayWorks();
        });
    })