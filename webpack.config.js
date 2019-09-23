module.exports = {
	context: __dirname + '/src',
	entry: {
		'blip-sdk.js': './BlipSdk.js',
		'blip-sdk.d.ts': './Types.d.ts'
	},
	externals: {
		'lime-js': {
			root: 'Lime',
			commonjs2: 'lime-js',
			commonjs: 'lime-js',
			amd: 'Lime'
		},
		'lime-transport-websocket': {
			root: 'WebSocketTransport',
			commonjs2: 'lime-transport-websocket',
			commonjs: 'lime-transport-websocket',
			amd: 'WebSocketTransport'
		},
		'bluebird': {
			root: 'Promise',
			commonjs2: 'bluebird',
			commonjs: 'bluebird',
			amd: 'Promise'
		}
	},
	output: {
		path: __dirname + '/dist',
		filename: '[name]',
		library: 'BlipSdk',
		libraryTarget: 'umd'
	},
	module: {
		preLoaders: [
			{ test: /(src|test)(.+)\.js$/, loader: 'eslint' }
		],
		loaders: [
			{ test: /(src|test)(.+)\.js$/, exclude: /node_modules/, loader: 'babel' },
			{ test: /\.json$/, loader: 'json' },
			{ test: /\.d.ts$/, exclude: /node_modules/, loader: 'raw-loader' },
			{ test: /(d!)\.ts(x?)$/, exclude: /node_modules/, loader: 'ts-loader' },
		]
	},
	devtool: 'source-map'
};
