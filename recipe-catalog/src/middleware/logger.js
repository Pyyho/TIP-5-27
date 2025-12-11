const fs = require('fs');
const path = require('path');

const logFilePath = path.join(__dirname, '../../logs/requests.log');

// Создаем папку logs если её нет
if (!fs.existsSync(path.dirname(logFilePath))) {
  fs.mkdirSync(path.dirname(logFilePath), { recursive: true });
}

const logger = (req, res, next) => {
  const startTime = Date.now();
  
  // Перехватываем отправку ответа
  const originalSend = res.send;
  res.send = function(body) {
    const duration = Date.now() - startTime;
    
    const logEntry = {
      timestamp: new Date().toISOString(),
      method: req.method,
      url: req.originalUrl,
      statusCode: res.statusCode,
      duration: `${duration}ms`,
      ip: req.ip,
      userAgent: req.get('User-Agent')
    };
    
    // Записываем в консоль
    console.log(`${logEntry.timestamp} ${req.method} ${req.originalUrl} ${res.statusCode} - ${duration}ms`);
    
    // Записываем в файл
    fs.appendFileSync(logFilePath, JSON.stringify(logEntry) + '\n');
    
    // Вызываем оригинальный метод send
    return originalSend.call(this, body);
  };
  
  next();
};

module.exports = logger;