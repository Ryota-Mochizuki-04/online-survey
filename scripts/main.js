document.addEventListener('DOMContentLoaded', function() {
    const saveButton = document.getElementById('save-button');
    const surveyForm = document.getElementById('survey-form');
    const dateOptionsContainer = document.getElementById('date-options');
    const userNameSelect = document.getElementById('user-name');

    // 第2月曜日を計算する関数
    function getSecondMonday(year, month) {
        const firstDay = new Date(year, month, 1);
        const firstMonday = firstDay.getDay() === 1 ? firstDay : new Date(year, month, 1 + (8 - firstDay.getDay()) % 7);
        return new Date(firstMonday.setDate(firstMonday.getDate() + 7));
    }

    // 現在の年月を取得
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth();

    // 第2月曜日を取得
    const secondMonday = getSecondMonday(year, month);

    // 第2月曜日から14日間の日付を生成
    for (let i = 0; i < 14; i++) {
        const currentDate = new Date(secondMonday);
        currentDate.setDate(secondMonday.getDate() + i);

        const dateOptionDiv = document.createElement('div');
        dateOptionDiv.classList.add('date-option');

        const label = document.createElement('label');
        label.textContent = `${currentDate.getDate()}日:`;

        const radioYes = document.createElement('input');
        radioYes.setAttribute('type', 'radio');
        radioYes.setAttribute('id', `date${i + 1}-yes`);
        radioYes.setAttribute('name', `date${i + 1}`);
        radioYes.setAttribute('value', '○');

        const labelYes = document.createElement('label');
        labelYes.setAttribute('for', `date${i + 1}-yes`);
        labelYes.textContent = '○';

        const radioMaybe = document.createElement('input');
        radioMaybe.setAttribute('type', 'radio');
        radioMaybe.setAttribute('id', `date${i + 1}-maybe`);
        radioMaybe.setAttribute('name', `date${i + 1}`);
        radioMaybe.setAttribute('value', '△');

        const labelMaybe = document.createElement('label');
        labelMaybe.setAttribute('for', `date${i + 1}-maybe`);
        labelMaybe.textContent = '△';

        const radioNo = document.createElement('input');
        radioNo.setAttribute('type', 'radio');
        radioNo.setAttribute('id', `date${i + 1}-no`);
        radioNo.setAttribute('name', `date${i + 1}`);
        radioNo.setAttribute('value', '×');

        const labelNo = document.createElement('label');
        labelNo.setAttribute('for', `date${i + 1}-no`);
        labelNo.textContent = '×';

        dateOptionDiv.appendChild(label);
        dateOptionDiv.appendChild(radioYes);
        dateOptionDiv.appendChild(labelYes);
        dateOptionDiv.appendChild(radioMaybe);
        dateOptionDiv.appendChild(labelMaybe);
        dateOptionDiv.appendChild(radioNo);
        dateOptionDiv.appendChild(labelNo);

        dateOptionsContainer.appendChild(dateOptionDiv);
    }

    // 保存ボタンがクリックされたときの処理
    saveButton.addEventListener('click', async () => {
        const userName = userNameSelect.value;
        if (!userName) {
            alert('名前を選択してください。');
            return;
        }

        const formData = new FormData(surveyForm);
        const responses = {};

        // 全ての日付が選択されているか確認
        let allSelected = true;
        for (let i = 0; i < 14; i++) {
            if (!formData.has(`date${i + 1}`)) {
                allSelected = false;
                break;
            }
        }

        if (!allSelected) {
            alert('全ての日付に対して選択を行ってください。');
            return;
        }

        // フォームデータをオブジェクトに変換
        formData.forEach((value, key) => {
            responses[key] = value;
        });

        // データをローカルストレージに保存
        localStorage.setItem(`surveyResponses_${userName}`, JSON.stringify(responses));

        // Lambda関数のエンドポイントにデータを送信
        const apiUrl = 'https://l5cmhf6us1.execute-api.ap-northeast-1.amazonaws.com/prod/saveSurveyResponse';
        try {
            const response = await fetch(apiUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ userName, responses })
            });

            if (response.ok) {
                alert('参加確認アンケートが保存されました！');
            } else {
                alert('データベースへの保存に失敗しました。');
            }
        } catch (error) {
            console.error("Error saving to Lambda", error);
            alert('データベースへの保存に失敗しました。');
        }
    });

    // ユーザーの回答を読み込む
    userNameSelect.addEventListener('change', () => {
        const userName = userNameSelect.value;
        if (!userName) return;

        const savedResponses = localStorage.getItem(`surveyResponses_${userName}`);
        if (savedResponses) {
            const responses = JSON.parse(savedResponses);
            for (const [key, value] of Object.entries(responses)) {
                const input = document.querySelector(`[name="${key}"][value="${value}"]`);
                if (input) {
                    input.checked = true;
                }
            }
        }
    });
});