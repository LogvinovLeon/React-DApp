/* global parity */
import React, {Component} from 'react';
import './App.css';
import PureRenderMixin from 'react-addons-pure-render-mixin';

class App extends Component {
    constructor(props) {
        super(props);
        this.shouldComponentUpdate = PureRenderMixin.shouldComponentUpdate.bind(this);
        this.componentWillUpdate = function (nextProps, nextState) {
            this.onNewBlock(nextState.blockNumber);
        }.bind(this);
        this.state = {};
        // Display block details
        setInterval(() => {
            parity.api.eth.blockNumber()
                .then(blockNumber => {
                    blockNumber = +blockNumber;
                    this.setState({block_number: blockNumber});
                    this.onNewBlock(blockNumber);
                })
                .catch(console.error.bind(console));
        }, 1000);
    }

    onNewBlock(newBlock) {
        var that = this;
        if (newBlock) {
            var blockPromises = [];
            for (var n = newBlock; n > newBlock - 5; n--) {
                blockPromises.push(parity.api.eth.getBlockByNumber(n));
            }
            Promise.all(blockPromises).then(blocks => {
                var transactions = [].concat.apply([], blocks.map(block => block.transactions));
                Promise.all(transactions.map(tx => parity.api.eth.getTransactionByHash(tx))).then(txs=> {
                    var count = txs.length;
                    var values = txs.map(tx=>+tx.value);
                    var sum = values.reduce((a, b) => a + b, 0);
                    var avg = sum / count;
                    that.setState({count, sum, avg})
                });
            })
        }
    }

    render() {
        return (
            <div className="App">
                <div className="App-header">
                    <img src="/parity.svg" className="App-logo" alt="logo"/>
                    <h2>Welcome to a Dapp world!</h2>
                </div>
                <p>
                    Block number: {this.state.block_number}
                    <br/>
                    Number of transactions in last 5 blocks: {this.state.count}
                    <br/>
                    Cumulative value in last 5 blocks: {this.state.sum}
                    <br/>
                    Average value in last 5 blocks: {this.state.avg}
                    <br/>
                </p>
            </div>
        );
    }
}

export default App;
