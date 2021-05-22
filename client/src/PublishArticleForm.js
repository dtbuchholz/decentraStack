import React, { useState } from 'react'

const intialState = {
	title: '',
	body: '',
}

const PublishArticleForm = (props) => {
	const [values, setValues] = useState(intialState)

	const handleChange = (event) => {
		const { name, value } = event.target
		setValues({
			...values,
			[name]: value,
		})
	}

	// TODO adjust logic to handle empty / undefined title or body being sumbitted, which is partically implemented
	// but doesn't give UI feedback on error. Also, fix logic on uploadPostToBlockchain` such that a post is only
	// uploaded to ipfs upon user accepting txn -- right now, data is uploaded to ipfs even if txn rejected by user
	const handleSubmit = (event) => {
		const isEmpty = (str) => !str.trim().length
		event.preventDefault()
		if ((values.title === undefined || isEmpty(values.title), values.body === undefined || isEmpty(values.body))) {
			console.log('error')
			event.stopPropagation()
		} else {
			console.log('Data was submitted: ' + values.title + ' ' + values.body)
			props.uploadPostToBlockchain({ title: values.title, body: values.body })
		}

		// TODO don't reset form values until accepted by blockchain; add Uniswap/etherscan-type popup
		// setValues(intialState)
	}

	return (
		<div className='container'>
			<form onSubmit={handleSubmit}>
				<div className='mb-3 input-group h1'>
					<input
						type='text'
						name='title'
						value={values.title}
						onChange={handleChange}
						id='publishArticleFormTitle'
						className='form-control no-focus no-input-border'
						placeholder='Title...'
						aria-label='Title'
						required
					/>
				</div>
				<div id='publishAreaContainer'>
					<div className='mb-3 input-group h5'>
						<textarea
							type='text'
							name='body'
							value={values.body}
							onChange={handleChange}
							className='form-control no-focus no-input-border'
							id='publishTextarea'
							placeholder='Write your thoughts...'
							aria-label='Content'
							required
						/>
					</div>
					<button
						type='submit'
						className='btn btn-primary no-focus'
						style={{ alignSelf: 'flex-end', position: 'absolute', bottom: 35 }}
					>
						Publish
					</button>
				</div>
			</form>
		</div>
	)
}

export default PublishArticleForm
