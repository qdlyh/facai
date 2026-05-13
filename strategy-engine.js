const STOCK_POOL = [
  { code: '002371', name: '北方华创', market: 0, sector: '半导体设备' },
  { code: '688012', name: '中微公司', market: 0, sector: '半导体设备' },
  { code: '688072', name: '拓荆科技', market: 0, sector: '半导体设备' },
  { code: '688037', name: '芯源微', market: 0, sector: '半导体设备' },
  { code: '002230', name: '科大讯飞', market: 0, sector: 'AI软' },
  { code: '688111', name: '金山办公', market: 0, sector: 'AI软' },
  { code: '603986', name: '兆易创新', market: 1, sector: '存储' },
  { code: '300223', name: '北京君正', market: 0, sector: '存储' },
  { code: '603160', name: '汇顶科技', market: 1, sector: '半导体' },
  { code: '300750', name: '宁德时代', market: 0, sector: '锂电' },
  { code: '300014', name: '亿纬锂能', market: 0, sector: '锂电' },
  { code: '688256', name: '寒武纪', market: 0, sector: 'AI芯片' },
  { code: '300308', name: '中际旭创', market: 0, sector: '光模块' },
  { code: '688041', name: '海光信息', market: 0, sector: 'AI芯片' },
  { code: '600118', name: '中国卫星', market: 1, sector: '航天' },
  { code: '300455', name: '航天智装', market: 0, sector: '航天' },
  { code: '600111', name: '北方稀土', market: 1, sector: '稀土' },
  { code: '300059', name: '东方财富', market: 0, sector: '金融科技' },
  { code: '688981', name: '中芯国际', market: 0, sector: '半导体制造' },
  { code: '603501', name: '韦尔股份', market: 1, sector: '半导体设计' },
  { code: '300661', name: '正海生物', market: 0, sector: '医疗' },
  { code: '002049', name: '紫光国微', market: 0, sector: '半导体设计' },
];

const REJECT_SECTORS = ['白酒', '地产', '券商', '军工'];

class StrategyEngine {
  constructor() {
    this.phase = '3-3';
    this.riskFlags = [];
  }

  evaluate(stockData, marketData) {
    if (!stockData) return { score: 0, verdict: 'nodata', signals: [], risks: [] };

    const { f43: price, f44: high, f45: low, f46: open, f47: volume,
            f48: amount, f50: volRatio, f170: changePct, f169: changeAmt,
            f15: highLimit, f16: lowLimit, f17: openBid, f18: closeAsk,
            f100: totalCap, f102: circCap } = stockData;

    const stock = STOCK_POOL.find(s => s.code === stockData.f57);
    const sector = stock?.sector || '其他';

    let score = 0;
    const signals = [];
    const risks = [];

    if (REJECT_SECTORS.includes(sector)) {
      return { score: 0, verdict: 'reject', signals: ['赛道不在阿狼关注范围'], risks: [`${sector}不是阿狼做的方向`] };
    }

    const isTech = ['半导体', 'AI', '存储', '航天', '锂电', '光模块', '芯片'].some(s => sector.includes(s));
    if (isTech) { score += 15; signals.push('✓ 科技赛道 +15分'); }

    if (marketData?.indexSupport) {
      const idxPrice = marketData.shPrice;
      if (idxPrice >= marketData.indexSupport[0] && idxPrice <= marketData.indexSupport[1]) {
        score += 15; signals.push('✓ 指数处于支撑位区间(4055-4060) +15分');
      }
    }

    if (open && price && open > price) {
      const dropPct = ((open - price) / open) * 100;
      if (dropPct >= 1) { score += 10; signals.push(`✓ 低开 ${dropPct.toFixed(1)}% +10分`); }
    }

    if (volRatio !== undefined && volRatio < 0.8) {
      score += 15; signals.push(`✓ 缩量(量比${volRatio.toFixed(2)}) +15分`);
    }

    if (changePct !== undefined) {
      if (changePct > 0 && changePct < 2) { score += 5; signals.push('✓ 微涨未过热 +5分'); }
    }

    if (marketData?.yellowLineAbove) { score += 10; signals.push('✓ 黄线在上 +10分'); }

    if (marketData?.hotSectors?.some(h => sector.includes(h))) {
      score += 5; signals.push(`✓ ${sector}为当前热点板块 +5分`);
    }

    if (this.phase === '3-3') { score += 5; signals.push('✓ 3-3平躺阶段 +5分（持仓不动）'); }
    if (this.phase === '3-2') { score += 3; signals.push('✓ 3-2震荡阶段 +3分（可做T）'); }

    score = Math.min(score, 100);

    let verdict = score >= 60 ? 'buy' : score >= 40 ? 'watch' : 'avoid';

    if (stockData.f51 && price && price >= stockData.f51 * 0.95) {
      risks.push('⚠ 接近涨停，追高风险大');
      if (verdict === 'buy') verdict = 'watch';
    }

    return { score, verdict, signals, risks, sector, phase: this.phase };
  }

  screen(allStocks, marketData) {
    const results = STOCK_POOL.map(s => {
      const stockData = allStocks[s.code];
      const evalResult = this.evaluate(stockData, marketData);
      return { ...s, ...evalResult, price: stockData?.f43, changePct: stockData?.f170 };
    });
    results.sort((a, b) => b.score - a.score);
    return results.slice(0, 10);
  }

  checkRisks(marketData) {
    this.riskFlags = [];
    if (!marketData) return [];

    if (marketData.shPrice && marketData.supportLevel && marketData.shPrice < marketData.supportLevel) {
      this.riskFlags.push({ level: 'danger', msg: '❌ 指数支撑破位' });
    }
    if (marketData.volumeStatus === 'shrinking') {
      this.riskFlags.push({ level: 'warn', msg: '⚠ 放量转缩量' });
    }
    if (marketData.gaobiaoCrash) {
      this.riskFlags.push({ level: 'danger', msg: '❌ 高标板块集体退潮' });
    }
    return this.riskFlags;
  }

  generateNextDayStrategy(marketData) {
    if (!marketData) return { strategy: '等待数据加载...' };
    const support = marketData.supportLevel || '4055-4060';
    const resistance = marketData.resistanceLevel || '4250-4300';
    const volStatus = marketData.volumeStatus === 'expanding' ? '放量' : '缩量';
    const phase = this.phase;
    const marginPressure = marketData.marginTotal ? (marketData.marginTotal / 10000).toFixed(1) : '3.0';

    let position = phase === '3-3' ? '7成（平躺不动）' : '5成（可做T）';
    if (marginPressure > 3.2) position = '减仓至5成';
    if (this.riskFlags.some(r => r.level === 'danger')) position = '减仓至3成';

    return {
      date: new Date().toISOString().slice(0, 10),
      direction: volStatus === '放量' && this.riskFlags.length === 0 ? '偏多' : '震荡',
      position,
      support,
      resistance,
      focusSectors: marketData.hotSectors?.join(' / ') || '半导体 / AI / 存储',
      strategy: `明日关注量能是否持续，支撑位看${support}，压力位看${resistance}。` +
        `两融压力在${marginPressure}万亿，未到3.2则持仓不动。` +
        `关注板块: ${marketData.hotSectors?.join('/') || '半导体/AI/存储'}\n` +
        `操作建议: ${volStatus === '放量' ? '持仓待涨，不追高，盘中急跌可加仓' : '缩量则谨慎，减仓至5成等信号'}` +
        (this.riskFlags.length > 0 ? `\n风控注意: ${this.riskFlags.map(r => r.msg).join('; ')}` : '')
    };
  }

  checkSinaJSONP(quoteStr) {
    if (!quoteStr || quoteStr === '') return null;
    const parts = quoteStr.split(',');
    if (parts.length < 30) return null;
    return {
      name: parts[0],
      open: parseFloat(parts[1]),
      close: parseFloat(parts[2]),
      price: parseFloat(parts[3]),
      high: parseFloat(parts[4]),
      low: parseFloat(parts[5]),
      volume: parseInt(parts[8]) / 100,
      amount: parseFloat(parts[9]),
      bid1: parseFloat(parts[10]),
      ask1: parseFloat(parts[11]),
    };
  }
}

if (typeof module !== 'undefined') module.exports = { StrategyEngine, STOCK_POOL };
