// First launch
const server = 'http://127.0.0.1:9999/'
toggle(false)

$.ajax({
    url: `${server}ping`,
    type: 'GET',
    timeout: 1000,
}).then(res => toggle(true), err => {
    alert('连接服务器失败，请注意标注工具插件限在实验室局域网使用。插件已自动关闭。')
    toggle(false)
})

chrome.storage.sync.get(info => {
    if (!info.hasOwnProperty('count'))
        chrome.storage.sync.set({
            'count': 0
        })
})

chrome.extension.onMessage.addListener((objRequest, _, sendResponse) => {
    switch (objRequest.type) {
        case "submit":
            let clazz = objRequest.index
            let url = objRequest.url
            let html = objRequest.html
            getCapture((data) => {
                var a = new FileReader();
                a.onload = e => {
                    $.ajax({
                        url: `${server}labels`,
                        type: 'POST',
                        contentType: "application/json;charset=UTF-8",
                        data: JSON.stringify({
                            "clazz": clazz,
                            "url": url,
                            "html": html,
                            "image": e.target.result
                        }),
                    })
                }
                a.readAsDataURL(data[0])
            })
            break
        case "alert":
            alert(objRequest.msg)
            break
        case "switch":
            toggle(objRequest.state)
            break
        case "getCapture":
            getCapture()
            break
        default:
            break
    }
});

// chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
//     if (changeInfo.status == 'complete')
//         continue
// })

/**
 * @name toggle
 * @description 控制工具的开启与关闭
 * 
 * @param {bool} state 
 */
function toggle(state) {
    chrome.storage.sync.set({
        'switch': state
    })
    if (state)
        chrome.browserAction.setIcon({
            path: "resource/logo.png"
        })
    else
        chrome.browserAction.setIcon({
            path: "resource/logo-disable.png"
        })
}
/**
 * @name updateCount
 * @description 更新标记统计计数
 * 
 */
function updateCount() {
    chrome.storage.sync.get(info => {
        chrome.storage.sync.set({
            'count': info.count + 1
        })
    })
}

function getCapture(callback) {
    chrome.tabs.query({
        active: true,
        currentWindow: true
    }, tabs => {
        var tab = tabs[0]
        currentTab = tab // used in later calls to get tab info
        CaptureAPI.captureToBlobs(tab, callback, err => alert(err))
    });
}