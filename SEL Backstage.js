// 後端代碼 Google Apps Script (GAS)
const GEMINI_API_KEY = "==========Gemini API Key==========";

const API_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent";

function doPost(e) {
  const createResponse = (obj) => {
    return ContentService.createTextOutput(JSON.stringify(obj))
      .setMimeType(ContentService.MimeType.JSON);
  };

  try {
    if (!e.postData || !e.postData.contents) {
      throw new Error("沒有收到有效的請求資料");
    }

    const requestData = JSON.parse(e.postData.contents);
    const userPrompt = requestData.prompt;

    const aiResponse = fetchGemini(userPrompt);
    
    return createResponse({
      success: true,
      text: aiResponse
    });

  } catch (error) {
    return createResponse({
      success: false,
      error: error.toString()
    });
  }
}

function fetchGemini(prompt) {
  const payload = {
    "contents": [{
      "parts": [{ "text": prompt }]
    }],
    "generationConfig": {
      "temperature": 0.7,
      "maxOutputTokens": 20000
    }
  };

  const options = {
    "method": "post",
    "contentType": "application/json",
    "payload": JSON.stringify(payload),
    "muteHttpExceptions": true
  };

  const response = UrlFetchApp.fetch(`${API_URL}?key=${GEMINI_API_KEY}`, options);
  const json = JSON.parse(response.getContentText());
  
  if (json.error) {
    throw new Error("Gemini API 錯誤: " + json.error.message);
  }

  if (json.candidates && json.candidates[0].content && json.candidates[0].content.parts) {
    return json.candidates[0].content.parts[0].text;
  } else {
    throw new Error("AI 回傳格式異常，請檢查 API Key 配額或內容限制");
  }
}

function doOptions(e) {
  return ContentService.createTextOutput("");
}