type LanguageKey = 'en' | 'zh';

export const translations: Record<LanguageKey, Record<string, string>> = {
	en: {
		// Navigation
		'nav.home': 'Home',
		'nav.seller': 'Seller',
		'nav.buyer': 'Buyer',
		'nav.guide': 'Guide',
		'nav.settings': 'Settings',
		'nav.connect': 'Connect Wallet',
		'nav.disconnect': 'Disconnect',

		// Home page
		'home.title': 'Escrow DApp',
		'home.subtitle': 'Secure P2P Trading on Blockchain',
		'home.createTrade': 'Create Trade',
		'home.queryTrade': 'Query Trade',
		'home.queryCredit': 'Query Credit',

		// Seller page
		'seller.title': 'Seller Trades',
		'seller.allTrades': 'All Trades',

		// Buyer page
		'buyer.title': 'Buyer Trades',
		'buyer.allTrades': 'All Trades',

		// Guide page
		'guide.title': 'Guide & FAQ',
		'guide.qna': 'Questions & Answers',

		// Trade status
		'status.created': 'Created',
		'status.joined': 'Joined',
		'status.confirmed': 'Confirmed',
		'status.cancelled': 'Cancelled',

		// Settings
		'settings.title': 'Settings',
		'settings.darkMode': 'Dark Mode',
		'settings.language': 'Language',
		'settings.english': 'English',
		'settings.chinese': '简体中文',

		// Common
		'common.loading': 'Loading...',
		'common.error': 'Error',
		'common.success': 'Success',
		'common.close': 'Close',
		'common.save': 'Save',
		'common.cancel': 'Cancel',
		'common.delete': 'Delete',
		'common.edit': 'Edit',
		'common.address': 'Address',
		'common.balance': 'Balance',
		'common.amount': 'Amount',
		'common.status': 'Status'
	},
	zh: {
		// Navigation
		'nav.home': '首页',
		'nav.seller': '卖家',
		'nav.buyer': '买家',
		'nav.guide': '指南',
		'nav.settings': '设置',
		'nav.connect': '连接钱包',
		'nav.disconnect': '断开连接',

		// Home page
		'home.title': '托管DApp',
		'home.subtitle': '开放的链上P2P交易',
		'home.createTrade': '创建交易',
		'home.queryTrade': '查询交易',
		'home.queryCredit': '查询信用',

		// Seller page
		'seller.title': '卖家交易',
		'seller.allTrades': '所有交易',

		// Buyer page
		'buyer.title': '买家交易',
		'buyer.allTrades': '所有交易',

		// Guide page
		'guide.title': '指南与常见问题',
		'guide.qna': '问答',

		// Trade status
		'status.created': '已创建',
		'status.joined': '已加入',
		'status.confirmed': '已确认',
		'status.cancelled': '已取消',

		// Settings
		'settings.title': '设置',
		'settings.darkMode': '深色模式',
		'settings.language': '语言',
		'settings.english': 'English',
		'settings.chinese': '简体中文',

		// Common
		'common.loading': '加载中...',
		'common.error': '错误',
		'common.success': '成功',
		'common.close': '关闭',
		'common.save': '保存',
		'common.cancel': '取消',
		'common.delete': '删除',
		'common.edit': '编辑',
		'common.address': '地址',
		'common.balance': '余额',
		'common.amount': '数量',
		'common.status': '状态'
	}
};

export function t(key: string, lang: LanguageKey = 'en'): string {
	const keys = key.split('.');
	let value: any = translations[lang];

	for (const k of keys) {
		value = value?.[k];
		if (!value) break;
	}

	return value || key;
}
