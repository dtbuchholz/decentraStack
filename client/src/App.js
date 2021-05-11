import React, { Component } from 'react'
import PostContract from './contracts/Post.json'
import getWeb3 from './getWeb3'
import Post from './Post'

import './App.css'

class App extends Component {
	state = {
		web3: null,
		accounts: null,
		contract: null,
		postTitle: null,
		postBody: null,
		blockchainDataAuthor: null,
		blockchainDataTitle: null,
		blockchainDataBody: null,
		blockchainDataDate: null,
		blockchainDataPostId: null,
		calculatedPostId: null,
	}

	componentDidMount = async () => {
		try {
			// Get network provider and web3 instance.
			const web3 = await getWeb3()

			// Use web3 to get the user's accounts.
			const accounts = await web3.eth.getAccounts()

			// Get the contract instance.
			const networkId = await web3.eth.net.getId()
			const deployedNetwork = PostContract.networks[networkId]
			const instance = new web3.eth.Contract(PostContract.abi, deployedNetwork && deployedNetwork.address)

			// Set web3, accounts, and contract to the state, and then proceed with an
			// example of interacting with the contract's methods.
			this.setState({ web3, accounts, contract: instance })
		} catch (error) {
			// Catch any errors for any of the above operations.
			alert(`Failed to load web3, accounts, or contract. Check console for details.`)
			console.error(error)
		}
	}

	connectWallet = async () => {
		await getWeb3()
	}

	readPostFromBlockchain = async () => {
		let post = await this.state.contract.getPastEvents('PostCreated')
		const calculatedPostId = this.state.web3.utils.soliditySha3(
			post[0]['returnValues']['_author'],
			post[0]['returnValues']['_title'],
			post[0]['returnValues']['_body'],
			post[0]['returnValues']['_date']
		)
		console.log('postID from js ', calculatedPostId)
		/* TODO: query events by the `calculatedPostId` so that you can show only the post the was sent, not all events 
    let queryPostById = await this.state.contract.getPastEvents('PostCreated').filter({ _postId: calculatedPostId })
		console.log('queryPostById: ', queryPostById)
    */
		this.setState({
			calculatedPostId,
		})
		console.log(post)
		console.log('postID from blockchain ', post[0]['returnValues']['_postId'])
		this.setState({
			blockchainDataAuthor: post[0]['returnValues']['_author'],
			blockchainDataTitle: post[0]['returnValues']['_title'],
			blockchainDataBody: post[0]['returnValues']['_body'],
			blockchainDataDate: post[0]['returnValues']['_date'],
			blockchainDataPostId: post[0]['returnValues']['_postId'],
		})
	}

	uploadPostToBlockchain = async (postTitle, postBody) => {
		const { accounts, contract } = this.state
		let author = accounts[0]
		console.log('uploading to blockchain from author: ', author)
		await contract.methods.createPost(postTitle, postBody).send({ from: author })
		//const response = await contract.methods.getPost().call()
		//this.setState({ blockchainData: response })
		this.readPostFromBlockchain()
	}

	postHandler = (data) => {
		console.log('data from App.js', data)
		this.setState({ postTitle: data.title, postBody: data.body })
		this.uploadPostToBlockchain(data.title, data.body)
	}

	render() {
		if (!this.state.web3) {
			return (
				<div>
					<button onClick={this.connectWallet}>Connect Wallet</button>
				</div>
			)
		}
		return (
			<div className='App'>
				<Post postHandler={this.postHandler} />
				<h2>Data from UI:</h2>
				<div>Post title: {this.state.postTitle}</div>
				<div className='postBody'>Post body: {this.state.postBody}</div>
				<h2>Data from Blockchain:</h2>
				<div>Post author: {this.state.blockchainDataAuthor}</div>
				<div>Post title: {this.state.blockchainDataTitle}</div>
				<div className='postBody'>Post body: {this.state.blockchainDataBody}</div>
				<div>Post date: {this.state.blockchainDataDate}</div>
				<div>Post ID: {this.state.blockchainDataPostId}</div>
				<div>---</div>
				<div>Calculated post ID: {this.state.calculatedPostId}</div>
			</div>
		)
	}
}

export default App
