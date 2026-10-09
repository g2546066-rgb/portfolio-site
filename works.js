// =========================
// Works
// =========================

fetch("./works.csv")
    .then(function(response) {

        if (!response.ok) {
            throw new Error("CSVの読み込みに失敗しました");
        }

        return response.text();

    })
    .then(function(data) {

        // CSVを行ごとに分割
        var rows = data.trim().split(/\r?\n/);

        if (rows.length < 2) {
            throw new Error("作品データがありません");
        }

        // 1行目は見出し
        var headers = rows[0].split(",").map(function(header) {
            return header.trim();
        });

        // 2行目以降を作品データにする
        var works = rows.slice(1)
            .filter(function(row) {
                return row.trim() !== "";
            })
            .map(function(row) {

                var values = row.split(",");

                var work = {};

                headers.forEach(function(header, index) {
                    work[header] = (values[index] || "").trim();
                });

                return work;

            });

        // HTML要素を取得
        var grid = document.getElementById("works-grid");
        var categorySelect = document.getElementById("category");
        var sortSelect = document.getElementById("sort");
        var message = document.getElementById("works-message");

        // 必要な要素が存在するか確認
        if (!grid || !categorySelect || !sortSelect) {
            throw new Error("必要なHTML要素が見つかりません");
        }

        // カテゴリ一覧を作る
        var categories = [];

        works.forEach(function(work) {

            if (
                work.category &&
                !categories.includes(work.category)
            ) {
                categories.push(work.category);
            }

        });

        // カテゴリを追加
        categories.sort().forEach(function(category) {

            var option = document.createElement("option");

            option.value = category;
            option.textContent = category;

            categorySelect.appendChild(option);

        });


        // =========================
        // Display Works
        // =========================

        function displayWorks() {

            var selectedCategory = categorySelect.value;
            var selectedSort = sortSelect.value;

            // 元のデータをコピー
            var filteredWorks = works.slice();

            // カテゴリで絞り込む
            if (selectedCategory !== "all") {

                filteredWorks = filteredWorks.filter(function(work) {
                    return work.category === selectedCategory;
                });

            }

            // 並び替え
            if (selectedSort === "newest") {

                filteredWorks.sort(function(a, b) {
                    return (Number(b.year) || 0) - (Number(a.year) || 0);
                });

            } else if (selectedSort === "oldest") {

                filteredWorks.sort(function(a, b) {
                    return (Number(a.year) || 0) - (Number(b.year) || 0);
                });

            } else if (selectedSort === "title") {

                filteredWorks.sort(function(a, b) {
                    return a.title.localeCompare(b.title, "ja");
                });

            }

            // 表示をクリア
            grid.replaceChildren();

            // 作品がない場合
            if (filteredWorks.length === 0) {

                if (message) {
                    message.textContent = "該当する作品はありません。";
                }

                return;

            }

            if (message) {
                message.textContent = "";
            }

            // 作品を表示
            filteredWorks.forEach(function(work) {

                var card = document.createElement("article");
                card.className = "work-card";

                var link = document.createElement("a");

                // リンク先を設定
                link.href = work.link || "#";

                // 別サイトへのリンクは新しいタブで開く
                if (
                    work.link &&
                    work.link !== "#" &&
                    /^https?:\/\//i.test(work.link)
                ) {
                    link.target = "_blank";
                    link.rel = "noopener noreferrer";
                }

                // 画像
                var imageWrap = document.createElement("div");
                imageWrap.className = "work-image-wrap";

                var image = document.createElement("img");

                image.src = work.image;
                image.alt = work.title || "作品画像";
                image.loading = "lazy";

                imageWrap.appendChild(image);

                // 作品情報
                var info = document.createElement("div");
                info.className = "work-info";

                var category = document.createElement("p");
                category.className = "work-category";
                category.textContent = work.category || "";

                var title = document.createElement("h3");
                title.textContent = work.title || "タイトルなし";

                var description = document.createElement("p");
                description.className = "work-description";
                description.textContent = work.description || "";

                var year = document.createElement("p");
                year.className = "work-year";
                year.textContent = work.year || "";

                info.appendChild(category);
                info.appendChild(title);
                info.appendChild(description);
                info.appendChild(year);

                link.appendChild(imageWrap);
                link.appendChild(info);

                card.appendChild(link);

                grid.appendChild(card);

            });

        }


        // 最初に表示
        displayWorks();

        // カテゴリ変更時
        categorySelect.addEventListener("change", displayWorks);

        // 並び替え変更時
        sortSelect.addEventListener("change", displayWorks);

    })
    .catch(function(error) {

        console.error("作品の読み込みエラー:", error);

        var message = document.getElementById("works-message");

        if (message) {
            message.textContent =
                "作品を読み込めませんでした。CSVファイルを確認してください。";
        }

    });


// =========================
// Weather
// =========================

// 東京の座標
var latitude = 35.681236;
var longitude = 139.767125;

var weatherUrl =
    "https://api.open-meteo.com/v1/forecast" +
    "?latitude=" + latitude +
    "&longitude=" + longitude +
    "&current=temperature_2m,weather_code" +
    "&timezone=Asia%2FTokyo";


fetch(weatherUrl)
    .then(function(response) {

        if (!response.ok) {
            throw new Error("天気情報を取得できませんでした");
        }

        return response.json();

    })
    .then(function(data) {

        var current = data.current;

        if (!current) {
            throw new Error("現在の天気データがありません");
        }

        var weatherCode = current.weather_code;
        var temperature = current.temperature_2m;

        showWeatherIcon(weatherCode, temperature);

    })
    .catch(function(error) {

        console.error("天気の取得エラー:", error);

        var icon = document.getElementById("weather-icon");
        var text = document.getElementById("weather-text");

        if (icon) {
            icon.textContent = "—";
        }

        if (text) {
            text.textContent = "Weather unavailable";
        }

    });


// =========================
// Show Weather
// =========================

function showWeatherIcon(code, temperature) {

    var icon = document.getElementById("weather-icon");
    var text = document.getElementById("weather-text");

    if (!icon || !text) {
        return;
    }

    var weatherIcon = "☁";
    var weatherText = "Cloudy";
    var weatherClass = "weather-cloudy";

    if (code === 0) {

        weatherIcon = "☀";
        weatherText = "Clear";
        weatherClass = "weather-sunny";

    } else if (code >= 1 && code <= 3) {

        weatherIcon = "☁";
        weatherText = "Cloudy";
        weatherClass = "weather-cloudy";

    } else if (
        (code >= 51 && code <= 67) ||
        (code >= 80 && code <= 82) ||
        code === 95 ||
        code === 96 ||
        code === 99
    ) {

        weatherIcon = "☂";
        weatherText = "Rain";
        weatherClass = "weather-rainy";

    } else if (code === 45 || code === 48) {

        weatherIcon = "☁";
        weatherText = "Fog";
        weatherClass = "weather-cloudy";

    }

    icon.textContent = weatherIcon;

    text.textContent =
        weatherText + " / " + temperature + "°C";

    // 天気に合わせてデザインを変更
    document.body.classList.remove(
        "weather-sunny",
        "weather-cloudy",
        "weather-rainy"
    );

    document.body.classList.add(weatherClass);

}