// 全局数据
const data = {
  spec: '',
  salePricePerMeter: '', 
  salePricePerPiece: '', 
  alloyPrice: 2600, // 匹配示例默认值
  wirePrice: 6500,  // 匹配示例默认值
  basePrice: 11.0,
  alloyHistoryPrice: 400,
  wireHistoryPrice: 3000,
  baseHistoryPrice: 10,
  alloyType: '6000',
  customTeeth: '',
  result: null,

  // 历史记录
  specHistory: [],
  priceHistory: [], 
  alloyHistory: [],
  wireHistory: [],
  baseHistory: [],

  // 上次值
  lastSpec: '',
  lastPricePerMeter: '', 
  lastPricePerPiece: '', 
  lastAlloy: 2600,
  lastWire: 6500,
  lastBase: 11.0,
  lastAlloyHistory: 400,
  lastWireHistory: 3000,
  lastBaseHistory: 10,

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
  
  currentLen: 0
};

// DOM元素
const el = {
  spec: document.getElementById('spec'),
  salePricePerMeter: document.getElementById('salePricePerMeter'),
  salePricePerPiece: document.getElementById('salePricePerPiece'),
  alloyPrice: document.getElementById('alloyPrice'),
  wirePrice: document.getElementById('wirePrice'),
  basePrice: document.getElementById('basePrice'),
  alloyHistoryPrice: document.getElementById('alloyHistoryPrice'),
  wireHistoryPrice: document.getElementById('wireHistoryPrice'),
  baseHistoryPrice: document.getElementById('baseHistoryPrice'),
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
  historyTotalCost: document.getElementById('historyTotalCost'),
  costCompare: document.getElementById('costCompare'),
  profit: document.getElementById('profit'),
  suggestPrice: document.getElementById('suggestPrice'),
  dailyOutput: document.getElementById('dailyOutput')
};

// 初始化
function init() {
  // 设置默认值
  el.alloyPrice.value = data.alloyPrice;
  el.wirePrice.value = data.wirePrice;
  el.basePrice.value = data.basePrice;
  el.alloyHistoryPrice.value = data.alloyHistoryPrice;
  el.wireHistoryPrice.value = data.wireHistoryPrice;
  el.baseHistoryPrice.value = data.baseHistoryPrice;

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
    
    if (val) {
      const p = val.split('*').map(Number);
      if (p.length === 4 && !p.some(isNaN)) {
        data.currentLen = p[0] / 1000;
        syncSalePrice();
      }
    }
    
    calc();
  });

  // 销售价-元/米输入框事件
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
    
    if (val && data.currentLen) {
      const perPiece = (parseFloat(val) * data.currentLen).toFixed(2);
      el.salePricePerPiece.value = perPiece;
      data.salePricePerPiece = perPiece;
      addHistory('price', perPiece);
    }
    
    calc();
  });
  
  // 销售价-元/条输入框事件
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

  // 合金历史价输入事件
  el.alloyHistoryPrice.addEventListener('focus', () => {
    data.lastAlloyHistory = el.alloyHistoryPrice.value;
    el.alloyHistoryPrice.value = '';
  });
  el.alloyHistoryPrice.addEventListener('blur', () => {
    const val = el.alloyHistoryPrice.value || data.lastAlloyHistory;
    el.alloyHistoryPrice.value = val;
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

  // 焊丝历史价输入事件
  el.wireHistoryPrice.addEventListener('focus', () => {
    data.lastWireHistory = el.wireHistoryPrice.value;
    el.wireHistoryPrice.value = '';
  });
  el.wireHistoryPrice.addEventListener('blur', () => {
    const val = el.wireHistoryPrice.value || data.lastWireHistory;
    el.wireHistoryPrice.value = val;
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

  // 基带历史价输入事件
  el.baseHistoryPrice.addEventListener('focus', () => {
    data.lastBaseHistory = el.baseHistoryPrice.value;
    el.baseHistoryPrice.value = '';
  });
  el.baseHistoryPrice.addEventListener('blur', () => {
    const val = el.baseHistoryPrice.value || data.lastBaseHistory;
    el.baseHistoryPrice.value = val;
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

  // 历史记录点击
  el.specHistory.addEventListener('click', (e) => {
    if (e.target.classList.contains('history-item')) {
      el.spec.value = e.target.dataset.val;
      el.specHistoryWrap.style.display = 'none';
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

// 同步销售价
function syncSalePrice() {
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
  const salePricePerPiece = el.salePricePerPiece.value;
  const alloyPrice = parseFloat(el.alloyPrice.value) || 2600;
  const wirePrice = parseFloat(el.wirePrice.value) || 6500;
  const basePrice = parseFloat(el.basePrice.value) || 11.0;
  const alloyHistoryPrice = parseFloat(el.alloyHistoryPrice.value) || 400;
  const wireHistoryPrice = parseFloat(el.wireHistoryPrice.value) || 3000;
  const baseHistoryPrice = parseFloat(el.baseHistoryPrice.value) || 10;

  if (!spec) {
    el.resultSection.style.display = 'none';
    return;
  }

  const p = spec.split('*').map(Number);
  if (p.length !== 4 || p.some(isNaN)) {
    alert('规格格式错误！请输入如：5300×100×1.05×20');
    el.resultSection.style.display = 'none';
    return;
  }

  const L = p[0], W=p[1], T=p[2], P=p[3];
  const len = L/1000;
  data.currentLen = len;
  const teeth = L/P;
  const alloyTeeth = getTeethCount();

  // 计算当前价成本
  const baseCost = data.baseWeight * len * basePrice;
  const alloyCost = (teeth / alloyTeeth) * alloyPrice;
  const wireCost = (teeth * data.wireConsume / 1000 / data.wireDensity) * wirePrice;

  // 计算历史价成本
  const baseHistoryCost = data.baseWeight * len * baseHistoryPrice;
  const alloyHistoryCost = (teeth / alloyTeeth) * alloyHistoryPrice;
  const wireHistoryCost = (teeth * data.wireConsume / 1000 / data.wireDensity) * wireHistoryPrice;

  // 固定成本分摊
  const t = teeth / data.teethPerMin + data.changeTime;
  const perDay = (data.workHours * 60) / t;
  const totalDailyOutput = perDay * data.lines;
  const perMonth = perDay * data.lines * (data.workDaysPerWeek * 4);

  const labor = data.labor / perMonth;
  const rent = data.rent / perMonth;
  const elec = data.electric / perMonth;

  // 当前价总成本、每米成本
  const totalCost = baseCost + alloyCost + wireCost + labor + rent + elec;
  const costPerMeter = totalCost / len;
  
  // 历史价总成本、每米成本
  const historyTotalCost = baseHistoryCost + alloyHistoryCost + wireHistoryCost + labor + rent + elec;
  const historyCostPerMeter = historyTotalCost / len;

  // 成本差值计算
  const costDiff = totalCost - historyTotalCost;
  const costDiffPerMeter = costPerMeter - historyCostPerMeter;

  const suggestPrice = totalCost * 1.3;
  const profit = salePricePerPiece ? (Number(salePricePerPiece) - totalCost) : 0;

  // 更新结果
  data.result = {
    L, W, T, P,
    totalCost: totalCost.toFixed(2),
    costPerMeter: costPerMeter.toFixed(2),
    historyTotalCost: historyTotalCost.toFixed(2),
    historyCostPerMeter: historyCostPerMeter.toFixed(2),
    costDiff: costDiff.toFixed(2),
    costDiffPerMeter: costDiffPerMeter.toFixed(2),
    profit: profit.toFixed(2),
    suggestPrice: suggestPrice.toFixed(2),
    dailyOutput: totalDailyOutput.toFixed(2)
  };

  // 渲染结果
  el.specResult.textContent = `规格：${L}×${W}×${T}×${P}`;
  el.totalCost.textContent = `材料：${totalCost.toFixed(2)} 元/条    ${costPerMeter.toFixed(2)} 元/米    当前成本`;
  el.historyTotalCost.textContent = `历史成本：${historyTotalCost.toFixed(2)} 元/条    ${historyCostPerMeter.toFixed(2)} 元/米`;
  
  // 渲染成本对比
  let compareText = '';
  let compareClass = '';
  if (costDiff > 0) {
    compareText = `成本对比：当前增加 ${Math.abs(costDiff).toFixed(2)} 元/条（${Math.abs(costDiffPerMeter).toFixed(2)} 元/米）`;
    compareClass = 'cost-rise';
  } else if (costDiff < 0) {
    compareText = `成本对比：当前减少 ${Math.abs(costDiff).toFixed(2)} 元/条（${Math.abs(costDiffPerMeter).toFixed(2)} 元/米）`;
    compareClass = 'cost-drop';
  } else {
    compareText = `成本对比：当前价与历史价持平`;
    compareClass = 'cost-same';
  }
  el.costCompare.className = `result-item ${compareClass}`;
  el.costCompare.textContent = compareText;
  
  // 有销售价才显示利润
  if (salePricePerPiece) {
    el.profit.textContent = `当前毛利润：${profit.toFixed(2)} 元/条`;
    el.profit.className = `result-item profit ${profit > 0 ? 'profit-green' : 'profit-red'}`;
    el.profit.style.display = 'block';
  } else {
    el.profit.style.display = 'none';
  }
  
  el.suggestPrice.textContent = `最低销售价：${suggestPrice.toFixed(2)} 元/条`;
  el.suggestPrice.style.display = 'block';
  el.dailyOutput.textContent = `当前规格日均产量：${totalDailyOutput.toFixed(2)} 条`;
  el.dailyOutput.style.display = 'block';
  
  el.resultSection.style.display = 'block';
}

// 初始化
window.onload = init;