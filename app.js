// 全局数据
const data = {
  spec: '',
  salePricePerMeter: '', // 新增：元/米
  salePricePerPiece: '', // 新增：元/条
  alloyPrice: 2250,
  wirePrice: 6200,
  basePrice: 11.0,
  alloyType: '6000',
  customTeeth: '',
  result: null,

  // 历史记录
  specHistory: [],
  priceHistory: [], // 保留，存储元/条的历史
  alloyHistory: [],
  wireHistory: [],
  baseHistory: [],

  // 上次值
  lastSpec: '',
  lastPricePerMeter: '', // 新增
  lastPricePerPiece: '', // 新增
  lastAlloy: 2250,
  lastWire: 6200,
  lastBase: 11.0,

  // 固定参数
  wireDensity: 580,
  wireConsume: 4,
  baseWeight: 0.41,
  labor: 37000,
  rent: 10500,
  electric: 5000,
  teethPerMin:7, 
  changeTime:20, 
  lines:6, 
  workHours:9, 
  workDaysPerWeek:6,
  
  // 缓存当前规格长度（用于联动计算）
  currentLen: 0
};

// DOM元素
const el = {
  spec: document.getElementById('spec'),
  // 替换原有salePrice，新增两个联动输入框
  salePricePerMeter: document.getElementById('salePricePerMeter'),
  salePricePerPiece: document.getElementById('salePricePerPiece'),
  alloyPrice: document.getElementById('alloyPrice'),
  wirePrice: document.getElementById('wirePrice'),
  basePrice: document.getElementById('basePrice'),
  alloyType: document.getElementById('alloyType'),
  customTeeth: document.getElementById('customTeeth'),
  customTeethWrap: document.getElementById('customTeethWrap'),
  
  // 历史记录
  specHistoryWrap: document.getElementById('specHistoryWrap'),
  specHistory: document.getElementById('specHistory'),
  priceHistoryWrap: document.getElementById('priceHistoryWrap'),
  priceHistory: document.getElementById('priceHistory'),
  alloyHistoryWrap: document.getElementById('alloyHistoryWrap'),
  alloyHistory: document.getElementById('alloyHistory'),
  wireHistoryWrap: document.getElementById('wireHistoryWrap'),
  wireHistory: document.getElementById('wireHistory'),
  baseHistoryWrap: document.getElementById('baseHistoryWrap'),
  baseHistory: document.getElementById('baseHistory'),

  // 结果区
  resultSection: document.getElementById('resultSection'),
  specResult: document.getElementById('specResult'),
  totalCost: document.getElementById('totalCost'),
  profit: document.getElementById('profit'),
  suggestPrice: document.getElementById('suggestPrice'),
  dailyOutput: document.getElementById('dailyOutput') // 保留之前新增的日均产量
};

// 初始化
function init() {
  // 设置默认值
  el.alloyPrice.value = data.alloyPrice;
  el.wirePrice.value = data.wirePrice;
  el.basePrice.value = data.basePrice;

  // 绑定事件
  bindEvents();
}

// 事件绑定
function bindEvents() {
  // 规格输入
  el.spec.addEventListener('focus', () => {
    data.lastSpec = el.spec.value;
    el.spec.value = '';
    el.specHistoryWrap.style.display = 'block';
    renderHistory('spec');
  });
  el.spec.addEventListener('blur', () => {
    const val = el.spec.value || data.lastSpec;
    el.spec.value = val;
    el.specHistoryWrap.style.display = 'none';
    addHistory('spec', val);
    
    // 解析规格并缓存长度（用于销售价联动）
    if (val) {
      const p = val.split('*').map(Number);
      if (p.length === 4 && !p.some(isNaN)) {
        data.currentLen = p[0] / 1000; // 毫米转米
        // 若已有销售价，重新联动计算
        syncSalePrice();
      }
    }
    
    calc();
  });

  // 新增：销售价-元/米输入框事件
  el.salePricePerMeter.addEventListener('focus', () => {
    data.lastPricePerMeter = el.salePricePerMeter.value;
    el.salePricePerMeter.value = '';
    el.priceHistoryWrap.style.display = 'block';
    renderHistory('price');
  });
  el.salePricePerMeter.addEventListener('blur', () => {
    const val = el.salePricePerMeter.value || data.lastPricePerMeter;
    el.salePricePerMeter.value = val;
    el.priceHistoryWrap.style.display = 'none';
    
    // 联动计算元/条
    if (val && data.currentLen) {
      const perPiece = (parseFloat(val) * data.currentLen).toFixed(2);
      el.salePricePerPiece.value = perPiece;
      data.salePricePerPiece = perPiece;
      addHistory('price', perPiece); // 历史记录存储元/条
    }
    
    calc();
  });
  
  // 新增：销售价-元/条输入框事件
  el.salePricePerPiece.addEventListener('focus', () => {
    data.lastPricePerPiece = el.salePricePerPiece.value;
    el.salePricePerPiece.value = '';
    el.priceHistoryWrap.style.display = 'block';
    renderHistory('price');
  });
  el.salePricePerPiece.addEventListener('blur', () => {
    const val = el.salePricePerPiece.value || data.lastPricePerPiece;
    el.salePricePerPiece.value = val;
    el.priceHistoryWrap.style.display = 'none';
    addHistory('price', val);
    
    // 联动计算元/米
    if (val && data.currentLen) {
      const perMeter = (parseFloat(val) / data.currentLen).toFixed(2);
      el.salePricePerMeter.value = perMeter;
      data.salePricePerMeter = perMeter;
    }
    
    calc();
  });

  // 合金单价输入
  el.alloyPrice.addEventListener('focus', () => {
    data.lastAlloy = el.alloyPrice.value;
    el.alloyPrice.value = '';
    el.alloyHistoryWrap.style.display = 'block';
    renderHistory('alloy');
  });
  el.alloyPrice.addEventListener('blur', () => {
    const val = el.alloyPrice.value || data.lastAlloy;
    el.alloyPrice.value = val;
    el.alloyHistoryWrap.style.display = 'none';
    addHistory('alloy', val);
    calc();
  });

  // 焊丝单价输入
  el.wirePrice.addEventListener('focus', () => {
    data.lastWire = el.wirePrice.value;
    el.wirePrice.value = '';
    el.wireHistoryWrap.style.display = 'block';
    renderHistory('wire');
  });
  el.wirePrice.addEventListener('blur', () => {
    const val = el.wirePrice.value || data.lastWire;
    el.wirePrice.value = val;
    el.wireHistoryWrap.style.display = 'none';
    addHistory('wire', val);
    calc();
  });

  // 基带单价输入
  el.basePrice.addEventListener('focus', () => {
    data.lastBase = el.basePrice.value;
    el.basePrice.value = '';
    el.baseHistoryWrap.style.display = 'block';
    renderHistory('base');
  });
  el.basePrice.addEventListener('blur', () => {
    const val = el.basePrice.value || data.lastBase;
    el.basePrice.value = val;
    el.baseHistoryWrap.style.display = 'none';
    addHistory('base', val);
    calc();
  });

  // 合金型号选择
  el.alloyType.addEventListener('change', () => {
    data.alloyType = el.alloyType.value;
    el.customTeethWrap.style.display = data.alloyType === 'custom' ? 'flex' : 'none';
    calc();
  });

  // 自定义粒数
  el.customTeeth.addEventListener('blur', calc);

  // 历史记录点击（适配元/条）
  el.specHistory.addEventListener('click', (e) => {
    if (e.target.classList.contains('history-item')) {
      el.spec.value = e.target.dataset.val;
      el.specHistoryWrap.style.display = 'none';
      // 解析规格并缓存长度
      const p = el.spec.value.split('*').map(Number);
      if (p.length === 4 && !p.some(isNaN)) {
        data.currentLen = p[0] / 1000;
        syncSalePrice();
      }
      calc();
    }
  });
  el.priceHistory.addEventListener('click', (e) => {
    if (e.target.classList.contains('history-item')) {
      const val = e.target.dataset.val;
      el.salePricePerPiece.value = val;
      el.priceHistoryWrap.style.display = 'none';
      // 联动计算元/米
      if (val && data.currentLen) {
        const perMeter = (parseFloat(val) / data.currentLen).toFixed(2);
        el.salePricePerMeter.value = perMeter;
        data.salePricePerMeter = perMeter;
      }
      calc();
    }
  });
  el.alloyHistory.addEventListener('click', (e) => {
    if (e.target.classList.contains('history-item')) {
      el.alloyPrice.value = e.target.dataset.val;
      el.alloyHistoryWrap.style.display = 'none';
      calc();
    }
  });
  el.wireHistory.addEventListener('click', (e) => {
    if (e.target.classList.contains('history-item')) {
      el.wirePrice.value = e.target.dataset.val;
      el.wireHistoryWrap.style.display = 'none';
      calc();
    }
  });
  el.baseHistory.addEventListener('click', (e) => {
    if (e.target.classList.contains('history-item')) {
      el.basePrice.value = e.target.dataset.val;
      el.baseHistoryWrap.style.display = 'none';
      calc();
    }
  });
}

// 新增：同步销售价（切换规格时重新计算联动值）
function syncSalePrice() {
  // 优先以元/条为准
  if (el.salePricePerPiece.value) {
    const perMeter = (parseFloat(el.salePricePerPiece.value) / data.currentLen).toFixed(2);
    el.salePricePerMeter.value = perMeter;
  } else if (el.salePricePerMeter.value) {
    const perPiece = (parseFloat(el.salePricePerMeter.value) * data.currentLen).toFixed(2);
    el.salePricePerPiece.value = perPiece;
  }
}

// 添加历史记录
function addHistory(type, val) {
  if (!val) return;
  const key = `${type}History`;
  let list = [...data[key]];
  list = list.filter(item => item !== val);
  list.unshift(val);
  if (list.length > 5) list = list.slice(0,5);
  data[key] = list;
}

// 渲染历史记录
function renderHistory(type) {
  const key = `${type}History`;
  const elKey = `${type}History`;
  const list = data[key];
  let html = '';
  
  if (type === 'price') {
    html = list.map(item => `<div class="history-item" data-val="${item}">${item}元/条</div>`).join('');
  } else if (type === 'alloy') {
    html = list.map(item => `<div class="history-item" data-val="${item}">${item}元/kg</div>`).join('');
  } else if (type === 'wire') {
    html = list.map(item => `<div class="history-item" data-val="${item}">${item}元/kg</div>`).join('');
  } else if (type === 'base') {
    html = list.map(item => `<div class="history-item" data-val="${item}">${item}元/kg</div>`).join('');
  } else {
    html = list.map(item => `<div class="history-item" data-val="${item}">${item}</div>`).join('');
  }
  
  el[elKey].innerHTML = html;
}

// 获取合金粒数
function getTeethCount() {
  if (data.alloyType !== 'custom') {
    return parseInt(data.alloyType);
  }
  return parseFloat(el.customTeeth.value) || 6000;
}

// 计算核心逻辑
function calc() {
  const spec = el.spec.value;
  // 从新输入框获取销售价（优先取元/条）
  const salePricePerPiece = el.salePricePerPiece.value;
  const alloyPrice = parseFloat(el.alloyPrice.value) || 2250;
  const wirePrice = parseFloat(el.wirePrice.value) || 6200;
  const basePrice = parseFloat(el.basePrice.value) || 11.0;

  // 仅校验规格（销售价非必填）
  if (!spec) {
    el.resultSection.style.display = 'none';
    return;
  }

  // 解析规格
  const p = spec.split('*').map(Number);
  if (p.length !== 4 || p.some(isNaN)) {
    alert('规格格式错误！请输入如：7520*55*0.95*18');
    el.resultSection.style.display = 'none';
    return;
  }

  const L = p[0], W=p[1], T=p[2], P=p[3];
  const len = L/1000;
  data.currentLen = len; // 缓存长度
  const teeth = L/P;
  const alloyTeeth = getTeethCount();

  // 计算成本
  const baseCost = data.baseWeight * len * basePrice;
  const alloyCost = (teeth / alloyTeeth) * alloyPrice;
  const wireCost = (teeth * data.wireConsume / 1000 / data.wireDensity) * wirePrice;

  // 固定成本分摊
  const t = teeth / data.teethPerMin + data.changeTime;
  const perDay = (data.workHours * 60) / t; // 单条线日均产量
  const totalDailyOutput = perDay * data.lines; // 总日均产量
  const perMonth = perDay * data.lines * (data.workDaysPerWeek * 4);

  const labor = data.labor / perMonth;
  const rent = data.rent / perMonth;
  const elec = data.electric / perMonth;

  // 总成本、每米成本、建议售价
  const totalCost = baseCost + alloyCost + wireCost + labor + rent + elec;
  const costPerMeter = totalCost / len; // 元/米成本
  const suggestPrice = totalCost * 1.3;
  const profit = salePricePerPiece ? (Number(salePricePerPiece) - totalCost) : 0;

  // 更新结果
  data.result = {
    L, W, T, P,
    totalCost: totalCost.toFixed(2),
    costPerMeter: costPerMeter.toFixed(2),
    profit: profit.toFixed(2),
    suggestPrice: suggestPrice.toFixed(2),
    dailyOutput: totalDailyOutput.toFixed(2)
  };

  // 渲染结果
  el.specResult.textContent = `规格：${L}×${W}×${T}×${P}`;
  el.totalCost.textContent = `材料成本：${totalCost.toFixed(2)} 元/条（${costPerMeter.toFixed(2)} 元/米）`;
  
  // 有销售价才显示利润
  if (salePricePerPiece) {
    el.profit.textContent = `毛利润：${profit.toFixed(2)} 元/条`;
    el.profit.className = `result-item profit ${profit > 0 ? 'profit-green' : 'profit-red'}`;
    el.profit.style.display = 'block';
  } else {
    el.profit.style.display = 'none';
  }
  
  // 始终显示建议售价和日均产量
  el.suggestPrice.textContent = `最低销售价：${suggestPrice.toFixed(2)} 元/条`;
  el.suggestPrice.style.display = 'block';
  el.dailyOutput.textContent = `当前规格日均产量：${totalDailyOutput.toFixed(2)} 条`;
  el.dailyOutput.style.display = 'block';
  
  el.resultSection.style.display = 'block';
}

// PWA配置：manifest.json（可选）
function createManifest() {
  const manifest = {
    "name": "锯条成本核算",
    "short_name": "成本核算",
    "start_url": "./index.html",
    "display": "standalone",
    "background_color": "#f5f5f5",
    "theme_color": "#07c160",
    "icons": [
      {
        "src": "icon.png",
        "sizes": "192x192",
        "type": "image/png"
      }
    ]
  };
  
  const blob = new Blob([JSON.stringify(manifest)], { type: 'application/json' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = 'manifest.json';
  a.click();
}

// 初始化
window.onload = init;