// 核心变量
const registerBox = document.getElementById('registerBox');
const videoBox = document.getElementById('videoBox');
const registerForm = document.getElementById('registerForm');
const video = document.getElementById('video');
const watchTime = document.getElementById('watchTime');
const adminBtn = document.getElementById('adminBtn');
const adminLogin = document.getElementById('adminLogin');
const loginBtn = document.getElementById('loginBtn');
const adminPwd = document.getElementById('adminPwd');
const recordList = document.getElementById('recordList');
const recordTbody = document.getElementById('recordTbody');
const exportBtn = document.getElementById('exportBtn');
// 管理员密码（可自行修改）
const ADMIN_PWD = '123456';
// 本地存储键名
const RECORD_KEY = 'watch_record_list';

// 1. 表单提交：下拉框取值和input兼容，无需修改
registerForm.onsubmit = function(e) {
    e.preventDefault();
    // 获取所有表单值（select通过value取值，和input一致）
    const name = document.getElementById('name').value;
    const dept1 = document.getElementById('dept1').value; // 一级部门下拉值
    const dept2 = document.getElementById('dept2').value; // 二级部门下拉值
    const workstation = document.getElementById('workstation').value;
    const phone = document.getElementById('phone').value;
    const remark = document.getElementById('remark').value || '无';
    // 生成登记信息
    const record = {
        name,
        dept1,
        dept2,
        workstation,
        phone,
        remark,
        registerTime: new Date().toLocaleString(),
        watchDuration: '00:00'
    };
    // 保存到本地存储
    saveRecord(record);
    // 隐藏登记框，显示视频框
    registerBox.style.display = 'none';
    videoBox.style.display = 'block';
    // 加载视频
    video.load();
    // 监听视频播放，计算观看时长
    calcWatchTime();
};

// 2. 保存记录到本地存储（无修改）
function saveRecord(newRecord) {
    const oldList = JSON.parse(localStorage.getItem(RECORD_KEY)) || [];
    // 避免同一手机号重复登记（可注释取消该限制）
    const isRepeat = oldList.some(item => item.phone === newRecord.phone);
    if (isRepeat) {
        alert('该手机号已登记，直接播放视频！');
        return;
    }
    oldList.push(newRecord);
    localStorage.setItem(RECORD_KEY, JSON.stringify(oldList));
}

// 3. 计算视频观看时长（无修改）
function calcWatchTime() {
    let startTime = 0;
    let timer = null;
    video.onplay = function() {
        startTime = new Date().getTime();
        timer = setInterval(() => {
            const currentTime = new Date().getTime();
            const duration = Math.floor((currentTime - startTime) / 1000);
            watchTime.innerText = formatTime(duration);
            updateWatchDuration(watchTime.innerText);
        }, 1000);
    };
    video.onpause = video.onended = function() {
        clearInterval(timer);
    };
}

// 格式化秒数为 时:分:秒 / 分:秒（无修改）
function formatTime(seconds) {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    if (h > 0) {
        return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
    } else {
        return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
    }
}

// 4. 更新本地存储的观看时长（无修改）
function updateWatchDuration(duration) {
    const oldList = JSON.parse(localStorage.getItem(RECORD_KEY)) || [];
    const phone = document.getElementById('phone').value;
    const index = oldList.findIndex(item => item.phone === phone);
    if (index !== -1) {
        oldList[index].watchDuration = duration;
        localStorage.setItem(RECORD_KEY, JSON.stringify(oldList));
    }
}

// 5. 管理员入口：显示/隐藏登录框（无修改）
adminBtn.onclick = function() {
    adminLogin.style.display = adminLogin.style.display === 'none' ? 'inline-block' : 'none';
};

// 6. 管理员登录：验证密码并显示记录（无修改）
loginBtn.onclick = function() {
    if (adminPwd.value === ADMIN_PWD) {
        adminLogin.style.display = 'none';
        recordList.style.display = 'block';
        renderRecordList();
    } else {
        alert('管理员密码错误！');
        adminPwd.value = '';
    }
};

// 7. 渲染登记记录列表（无修改，直接展示下拉选择的部门值）
function renderRecordList() {
    const recordList = JSON.parse(localStorage.getItem(RECORD_KEY)) || [];
    if (recordList.length === 0) {
        recordTbody.innerHTML = '<tr><td colspan="9">暂无登记记录</td></tr>';
        return;
    }
    let html = '';
    recordList.forEach((item, index) => {
        html += `
            <tr>
                <td>${index + 1}</td>
                <td>${item.name}</td>
                <td>${item.dept1}</td>
                <td>${item.dept2}</td>
                <td>${item.workstation}</td>
                <td>${item.phone}</td>
                <td>${item.remark}</td>
                <td>${item.registerTime}</td>
                <td>${item.watchDuration}</td>
            </tr>
        `;
    });
    recordTbody.innerHTML = html;
}

// 8. 导出Excel（无修改，同步导出下拉选择的部门值）
exportBtn.onclick = function() {
    const recordList = JSON.parse(localStorage.getItem(RECORD_KEY)) || [];
    if (recordList.length === 0) {
        alert('暂无记录可导出！');
        return;
    }
    const exportData = recordList.map((item, index) => ({
        序号: index + 1,
        姓名: item.name,
        一级部门: item.dept1,
        二级部门: item.dept2,
        工号: item.workstation,
        手机号: item.phone,
        备注: item.remark,
        登记时间: item.registerTime,
        累计观看时长: item.watchDuration
    }));
    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.json_to_sheet(exportData);
    XLSX.utils.book_append_sheet(wb, ws, '观看登记记录');
    XLSX.writeFile(wb, `扫码观看登记记录_${new Date().toLocaleDateString()}.xlsx`);
};

// 页面加载（无修改）
window.onload = function() {};