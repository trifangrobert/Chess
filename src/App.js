import { useState } from "react";
import Board from "./components/Board.js";
import PieceMoves from "./pieces/PieceMoves.js";
import doMove from "./chess rules/DoMove.js";
import { getPiece, getPos } from "./useful functions/PieceFunctions.js";
import AttackedPositions from "./pieces/Moves/AttackedPositions.js";
import { getPieceColor } from "./useful functions/PieceFunctions";
import checkPawnPromotion from "./chess rules/PawnPromotion.js";
import PawnPromotionBox from "./components/PawnPromotionBox.js";
import Endgame from "./components/Endgame";
import classes from "./App.module.css";

const emptyBoard = () => {
  return [new Array(64).fill(null), new Array(64).fill(null)];
};

let whoMoves = 0;
let lastMove = [null, null];
let gameMoves = [];

const initBoard = () => {
  /* 
  1 -> King
  2 -> Queen
  3 -> Bishop
  4 -> Knight
  5 -> Rook
  6 -> Pawn
  1-6 white, 7-12 black
  */
  let board = emptyBoard();

  // Stalemate tester
  // board[0][56] = 5;
  // board[0][58] = 5;
  // board[0][7] = 5;
  // board[0][23] = 5;
  // board[0][63] = 1;
  // board[0][9] = 7;

  for (let i = 0; i < 8; i++) {
    board[0][48 + i] = 6; // white pawn
    board[0][8 + i] = 12; //black pawn
  }
  board[0][60] = 1; // white king
  board[0][4] = 7; // black king

  board[0][59] = 2; // white queen
  board[0][3] = 8; // black queen

  board[0][58] = board[0][61] = 3; // white bishop
  board[0][2] = board[0][5] = 9; // black queen

  board[0][57] = board[0][62] = 4; // white knight
  board[0][1] = board[0][6] = 10; // black knight

  board[0][56] = board[0][63] = 5; // white rook
  board[0][0] = board[0][7] = 11; // black rook

  return board;
};

const initGame = () => {
  return true;
};



const check = (board) => {
  // console.log(board);
  let whitePieces = [],
    blackPieces = [];
  for (let i = 0; i < 64; ++i) {
    if (getPieceColor(board[i]) === 0) {
      whitePieces.push(i);
    }
    if (getPieceColor(board[i]) === 1) {
      blackPieces.push(i);
    }
  }
  // console.log("check for check");
  // console.log(board);
  // console.log(whitePieces, blackPieces);
  let whiteMoves = AttackedPositions(board, 0);
  let blackMoves = AttackedPositions(board, 1);
  let checkWhite = false,
    checkBlack = false;
  // console.log(whiteMoves, blackMoves);
  for (let i = 0; i < whiteMoves.length; ++i) {
    if (board[whiteMoves[i]] === 7) {
      checkBlack = true;
    }
  }
  for (let i = 0; i < blackMoves.length; ++i) {
    if (board[blackMoves[i]] === 1) {
      checkWhite = true;
    }
  }
  // console.log(checkWhite, checkBlack);
  return [checkWhite, checkBlack];
};

const checkMate = (board, player) => {
  if (player === 0) {
    let whitePieces = [];
    for (let i = 0; i < 64; ++i) {
      if (getPieceColor(board[i]) === 0) {
        whitePieces.push(i);
      }
    }
    for (let i = 0; i < whitePieces.length; ++i) {
      let l = PieceMoves(whitePieces[i], board, gameMoves);
      for (let j = 0; j < l.length; ++j) {
        let nextBoard = emptyBoard();
        for (let i = 0; i < 64; ++i) {
          nextBoard[i] = board[i];
        }
        nextBoard = doMove(nextBoard, [whitePieces[i], l[j]], l[j], lastMove);
        let [checkWhite, checkBlack] = check(nextBoard);
        if (checkWhite === false) {
          return false;
        }
      }
    }
    return true;
  } else {
    let blackPieces = [];
    for (let i = 0; i < 64; ++i) {
      if (getPieceColor(board[i]) === 1) {
        blackPieces.push(i);
      }
    }
    for (let i = 0; i < blackPieces.length; ++i) {
      let l = PieceMoves(blackPieces[i], board, gameMoves);
      // console.log(l);
      for (let j = 0; j < l.length; ++j) {
        let nextBoard = emptyBoard();
        for (let k = 0; k < 64; ++k) {
          nextBoard[k] = board[k];
        }
        // console.log(nextBoard);
        nextBoard = doMove(nextBoard, [blackPieces[i], l[j]], l[j], lastMove);
        let [checkWhite, checkBlack] = check(nextBoard);
        if (checkBlack === false) {
          return false;
        }
      }
    }
    return true;
  }
};

const staleMate = (board, player) => {
  let whitePieces = [],
    blackPieces = [];
  for (let i = 0; i < 64; ++i) {
    if (getPieceColor(board[i]) === 0) {
      whitePieces.push(i);
    }
    if (getPieceColor(board[i]) === 1) {
      blackPieces.push(i);
    }
  }

  // console.log(whitePieces, blackPieces);
  let whiteMoves = [],
    blackMoves = [];
  for (let i = 0; i < whitePieces.length; ++i) {
    let l = PieceMoves(whitePieces[i], board, gameMoves);
    whiteMoves.push(...l);
  }
  for (let i = 0; i < blackPieces.length; ++i) {
    let l = PieceMoves(blackPieces[i], board, gameMoves);
    blackMoves.push(...l);
  }
  let [checkWhite, checkBlack] = check(board);
  // console.log(whiteMoves, blackMoves);
  // console.log(checkWhite, checkBlack);
  // console.log(player);
  if (player === 0) {
    if (checkWhite === false && whiteMoves.length === 0) {
      return true;
    }
    return false;
  } else {
    if (checkBlack === false && blackMoves.length === 0) {
      return true;
    }
    return false;
  }
};

const endGame = (board, player) => {
  if (staleMate(board, player)) {
    // console.log("stalemate");
    return 2;
  }
  let [checkWhite, checkBlack] = check(board);
  if (player === 0 && checkWhite === false) {
    return 0;
  }
  if (player === 1 && checkBlack === false) {
    return 0;
  }
  if (checkMate(board, player)) {
    // console.log("checkmate");
    return 1;
  }
  return 0;
};

let currMove;

const App = () => {
  const handleClickProm = (piece) => {
    // console.log("piece", piece);
    setChessBoard((prevState) => {
      let board = emptyBoard();
      for (let i = 0; i < 64; ++i) {
        if (prevState[1][i] === 5) {
          board[1][i] = 5;
        }
        board[0][i] = prevState[0][i];
      }
      board[0][currMove[1]] = piece;
      let [checkWhite, checkBlack] = check(board[0]);
      if (checkBlack === true) {
        for (let i = 0; i < 64; ++i) {
          if (board[0][i] === 7) {
            board[1][i] = 4;
          }
        }
      }
      if (checkWhite === true) {
        for (let i = 0; i < 64; ++i) {
          if (board[0][i] === 1) {
            board[1][i] = 4;
          }
        }
      }
      return board;
    });
    setPawnPromotionStyle({ display: "none" });
    setAllowMove(true);
  };
  initGame();
  const [showModal, setShowModal] = useState(false);
  const [messageEndgame, setMessageEndgame] = useState("");
  const [chessBoard, setChessBoard] = useState(initBoard());
  const [selectedPiece, setSelectedPiece] = useState(null);
  const [positions, setPositions] = useState([]);
  const [allowMove, setAllowMove] = useState(true);
  const [pawnPromotionStyle, setPawnPromotionStyle] = useState({
    display: "none",
  });
  // console.log(chessBoard);
  const handleClick = (index) => {
    let move = null;
    let currPositions = [];

    if (selectedPiece !== null && positions.includes(index)) {
      move = [selectedPiece, index];
      setPositions([]);
      currPositions = [];
      setSelectedPiece(index);
    } else {
      // console.log("allowMove: ", allowMove);
      if (!allowMove) {
        setPositions([]);
        setSelectedPiece(null);
        currPositions = [];
        move = null;
      } else {
        if (
          chessBoard[0][index] === null ||
          getPieceColor(chessBoard[0][index]) !== whoMoves
        ) {
          setPositions([]);
          setSelectedPiece(null);
          currPositions = [];
          move = null;
        } else {
          currPositions = PieceMoves(index, chessBoard[0], gameMoves);
          // console.log(currPositions);
          setPositions(currPositions);
          setSelectedPiece(index);
        }
      }
    }

    setChessBoard((prevState) => {
      let board = emptyBoard();
      // console.log(whoMoves);
      if (
        prevState[0][index] !== null &&
        getPieceColor(prevState[0][index]) === whoMoves
      ) {
        if (allowMove) {
          board[1][index] = 3;
        }
      }
      for (let i = 0; i < 64; ++i) {
        if (prevState[1][i] === 5) {
          board[1][i] = 5;
        }
        board[0][i] = prevState[0][i];
      }
      // console.log(move);
      if (move !== null) {
        currMove = move;
        gameMoves.push([chessBoard[0][move[0]], move[0], move[1], board]);
        let player = getPieceColor(board[0][move[0]]);
        board[1][lastMove[0]] = null;
        board[1][lastMove[1]] = null;
        board[0] = doMove(board[0], move, index, lastMove);
        if (checkPawnPromotion(board[0], move)) {
          // console.log("pawn promotion");
          let [x, y] = getPos(move[1]);
          if (getPieceColor(board[0][move[1]]) === 1) {
            // console.log("black prom");
            setPawnPromotionStyle({
              display: "grid",
              left: (28.5 + 4.3 * y).toString() + "%",
              bottom: "-51em",
            });
          } else {
            // console.log("white prom");
            setPawnPromotionStyle({
              display: "grid",
              left: (28.5 + 4.3 * y).toString() + "%",
              top: "3em",
            });
          }
          setAllowMove(false);
          // console.log(pawnPromotionStyle);
        }
        lastMove = move;
        board[1][move[1]] = null;
        let endGameResult = endGame(board[0], 1 - player);
        if (endGameResult) {
          setShowModal(true);
          if (endGameResult === 1) {
            if (player === 1) {
              setMessageEndgame("Checkmate! Black won!");
            }
            else {
              setMessageEndgame("Checkmate! White won!");
            }
            
          }
          if (endGameResult === 2) {
            setMessageEndgame("Stalemate!");
          }
          setPawnPromotionStyle({ display: "none" });
          setAllowMove(false);
        }
        whoMoves ^= 1;
      }
      board[1][lastMove[0]] = 5;
      board[1][lastMove[1]] = 5;
      for (let i = 0; i < currPositions.length; ++i) {
        if (prevState[0][currPositions[i]] !== null) {
          board[1][currPositions[i]] = 2;
        } else {
          board[1][currPositions[i]] = 1;
        }
      }
      let [checkWhite, checkBlack] = check(board[0]);
      if (checkBlack === true) {
        for (let i = 0; i < 64; ++i) {
          if (board[0][i] === 7) {
            board[1][i] = 4;
          }
        }
      }
      if (checkWhite === true) {
        for (let i = 0; i < 64; ++i) {
          if (board[0][i] === 1) {
            board[1][i] = 4;
          }
        }
      }

      return board;
    });
  };

  const handleCloseModal = () => {
    setShowModal(false);
  }

  const handleRestart = () => {
    setShowModal(false);
    setMessageEndgame("");
    setChessBoard(initBoard());
    setSelectedPiece(null);
    setPositions([]);
    setAllowMove(true);
    setPawnPromotionStyle({
      display: "none",
    });
    whoMoves = 0;
    lastMove = [null, null];
    gameMoves = [];

  }

  // console.log(pawnPromotionStyle);
  return (
    <div>
      {showModal && <Endgame message={messageEndgame} onClose={handleCloseModal} handleButtonPlayAgain={handleRestart}/>}
      <Board handleClick={handleClick} board={chessBoard}>
        <PawnPromotionBox
          handleClickProm={handleClickProm}
          pawnPromotionStyle={pawnPromotionStyle}
          player={1 - whoMoves}
        />
      </Board>
    </div>
  );
};

export default App;
