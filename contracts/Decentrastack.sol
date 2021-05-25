// SPDX-License-Identifier: MIT
pragma solidity >=0.4.21 <0.7.0;
pragma experimental ABIEncoderV2;

contract Decentrastack {
  // get all articles ever written
  Article[] public articles;
  
  struct Article {
    address author;
    string title; // TODO max characters for an article title *should be* 70
    string body; // ipfs hash of body content, to reduce storage costs
    // ipfs hash is 46 bytes so maybe find way to byte pack via sepaarting into:
    /* struct Multihash {
        bytes32 hash
        uint8 hash_function
        uint8 size
    } */
    uint256 date; // uint32 would make max data in year 2106
    bytes32 articleId; // articleId can be cheaper if just a counter instead of keccak hash
  }

  // @dev consider adding index variable for each array; to help with lookups instead of for loop
  mapping(address => Article[]) public authorToArticles;
  mapping(address => address[]) public usersToSubscribedAuthors;

  event ArticlePublished(address indexed _author, string _title, string indexed _body, uint256 _date, bytes32 indexed _articleId);
  event NewUserSubscription(address indexed _follower, address indexed _author);
  event UserUnsubscribedFromAuthor(address indexed _follower, address indexed _author);

  function createArticle(string memory _title, string memory _body) public {
    require(bytes(_title).length > 0, "Title must have a non-empty value");
    require(bytes(_body).length > 0, "Body content must have a non-empty value");
    Article memory newArticle = Article({
      author: msg.sender,
      title: _title,
      body: _body,
      date: now,
      articleId: keccak256(abi.encodePacked(msg.sender, _title, _body, now))
    });

    authorToArticles[msg.sender].push(newArticle);
    articles.push(newArticle);
    
    emit ArticlePublished(newArticle.author, newArticle.title, newArticle.body, newArticle.date, newArticle.articleId);
  }

  function getArticles() public view returns(Article[] memory) {
      return articles;
  }

  function getUserToSubscribedAuthors(address _user) public view returns(address[] memory) {
      return usersToSubscribedAuthors[_user];
  }

  // subscribe to author
  function subscribeToAuthor(address _author) public {
    require(_author != address(0), 'Invalid author');
    require(_author != msg.sender, 'Author cannot subscribe to itself');
    bool alreadySubscribed = false;
    for(uint i = 0; i < usersToSubscribedAuthors[msg.sender].length; i++) {
      if(usersToSubscribedAuthors[msg.sender][i] == _author) {
        alreadySubscribed = true;
        break;
      }
    }
    if(!alreadySubscribed) {
        usersToSubscribedAuthors[msg.sender].push(_author);
        emit NewUserSubscription(msg.sender, _author);
    }
  }

  // unsubscribe from author
  function unsubscribeFromAuthor(address _author) public {
    require(_author != address(0), 'Invalid _author');
    for(uint i = 0; i < usersToSubscribedAuthors[msg.sender].length; i++) {
      if(usersToSubscribedAuthors[msg.sender][i] == _author) {
        // swap index with the last item in the array and then `delete` & shorten array
        // @dev this is to prevent 0x0 value being written to author & bloating array
        usersToSubscribedAuthors[msg.sender][i] = usersToSubscribedAuthors[msg.sender][usersToSubscribedAuthors[msg.sender].length - 1];
        delete usersToSubscribedAuthors[msg.sender][usersToSubscribedAuthors[msg.sender].length - 1];
        usersToSubscribedAuthors[msg.sender].length--;
        emit UserUnsubscribedFromAuthor(msg.sender, _author);
        break;
      }
    }
  }
}