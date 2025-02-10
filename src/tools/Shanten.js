class Shanten {
    constructor() {
        this.AGARI_STATE = -1;

        this.tiles = [];
        this.number_melds = 0;
        this.number_tatsu = 0;
        this.number_pairs = 0;
        this.number_jidahai = 0;
        this.number_characters = 0;
        this.number_isolated_tiles = 0;
        this.min_shanten = 0;
    }

    calculateShanten(tiles34, useChiitoitsu = true, useKokushi = true) {
        const shantenResults = [this.calculateShantenForRegularHand(tiles34)];
        if (useChiitoitsu) {
            shantenResults.push(this.calculateShantenForChiitoitsuHand(tiles34));
        }
        if (useKokushi) {
            shantenResults.push(this.calculateShantenForKokushiHand(tiles34));
        }

        return Math.min(...shantenResults);
    }

    calculateShantenForChiitoitsuHand(tiles34) {
        // 計算對子數量，且每個對子必須是不同的牌
        let pairs = 0;
        let uniquePairs = 0;
        for (let i = 0; i < tiles34.length; i++) {
            if (tiles34[i] >= 2) {
                pairs++;
                if (tiles34[i] === 2) {
                    uniquePairs++; // 只有恰好2張才算不同的對子
                }
            }
        }

        // 特殊情況 1
        if (tiles34.filter((x) => x === 2).length === 4 && tiles34.filter((x) => x === 3).length === 2) {
            return 1;
        }

        // 特殊情況 2
        if (tiles34.filter((x) => x === 2).length === 5 && tiles34.filter((x) => x === 4).length === 1) {
            return 1;
        }

        if (pairs === 7 && uniquePairs === 7) {
            return this.AGARI_STATE;
        }

        // 計算向聽數
        return 6 - pairs;
    }

    calculateShantenForKokushiHand(tiles34) {
        const indices = [...TERMINAL_INDICES, ...HONOR_INDICES];

        let completedTerminals = 0;
        for (const i of indices) {
            completedTerminals += tiles34[i] >= 2 ? 1 : 0;
        }

        let terminals = 0;
        for (const i of indices) {
            terminals += tiles34[i] !== 0 ? 1 : 0;
        }

        return 13 - terminals - (completedTerminals ? 1 : 0);
    }

    calculateShantenForRegularHand(tiles34) {
        tiles34 = [...tiles34]; // 複製數組

        this._init(tiles34);

        const countOfTiles = tiles34.reduce((sum, x) => sum + x, 0);
        if (countOfTiles > 14) {
            throw new Error(`Too many tiles = ${countOfTiles}`);
        }

        this._removeCharacterTiles(countOfTiles);

        const initMentsu = Math.floor((14 - countOfTiles) / 3);
        this._scan(initMentsu);

        return this.min_shanten;
    }

    _init(tiles) {
        this.tiles = tiles;
        this.number_melds = 0;
        this.number_tatsu = 0;
        this.number_pairs = 0;
        this.number_jidahai = 0;
        this.number_characters = 0;
        this.number_isolated_tiles = 0;
        this.min_shanten = 8;
    }

    _scan(initMentsu) {
        this.number_characters = 0;
        for (let i = 0; i < 27; i++) {
            this.number_characters |= (this.tiles[i] === 4) << i;
        }
        this.number_melds += initMentsu;
        this._run(0);
    }

    _run(depth) {
        if (this.min_shanten === this.AGARI_STATE) {
            return;
        }

        while (!this.tiles[depth]) {
            depth++;

            if (depth >= 27) {
                break;
            }
        }

        if (depth >= 27) {
            return this._updateResult();
        }

        let i = depth;
        if (i > 8) {
            i -= 9;
        }
        if (i > 8) {
            i -= 9;
        }

        if (this.tiles[depth] === 4) {
            this._increaseSet(depth);
            if (i < 7 && this.tiles[depth + 2]) {
                if (this.tiles[depth + 1]) {
                    this._increaseSyuntsu(depth);
                    this._run(depth + 1);
                    this._decreaseSyuntsu(depth);
                }
                this._increaseTatsuSecond(depth);
                this._run(depth + 1);
                this._decreaseTatsuSecond(depth);
            }

            if (i < 8 && this.tiles[depth + 1]) {
                this._increaseTatsuFirst(depth);
                this._run(depth + 1);
                this._decreaseTatsuFirst(depth);
            }

            this._increaseIsolatedTile(depth);
            this._run(depth + 1);
            this._decreaseIsolatedTile(depth);
            this._decreaseSet(depth);
            this._increasePair(depth);

            if (i < 7 && this.tiles[depth + 2]) {
                if (this.tiles[depth + 1]) {
                    this._increaseSyuntsu(depth);
                    this._run(depth);
                    this._decreaseSyuntsu(depth);
                }
                this._increaseTatsuSecond(depth);
                this._run(depth + 1);
                this._decreaseTatsuSecond(depth);
            }

            if (i < 8 && this.tiles[depth + 1]) {
                this._increaseTatsuFirst(depth);
                this._run(depth + 1);
                this._decreaseTatsuFirst(depth);
            }

            this._decreasePair(depth);
        }

        if (this.tiles[depth] === 3) {
            this._increaseSet(depth);
            this._run(depth + 1);
            this._decreaseSet(depth);
            this._increasePair(depth);

            if (i < 7 && this.tiles[depth + 1] && this.tiles[depth + 2]) {
                this._increaseSyuntsu(depth);
                this._run(depth + 1);
                this._decreaseSyuntsu(depth);
            } else {
                if (i < 7 && this.tiles[depth + 2]) {
                    this._increaseTatsuSecond(depth);
                    this._run(depth + 1);
                    this._decreaseTatsuSecond(depth);
                }

                if (i < 8 && this.tiles[depth + 1]) {
                    this._increaseTatsuFirst(depth);
                    this._run(depth + 1);
                    this._decreaseTatsuFirst(depth);
                }
            }

            this._decreasePair(depth);

            if (i < 7 && this.tiles[depth + 2] >= 2 && this.tiles[depth + 1] >= 2) {
                this._increaseSyuntsu(depth);
                this._increaseSyuntsu(depth);
                this._run(depth);
                this._decreaseSyuntsu(depth);
                this._decreaseSyuntsu(depth);
            }
        }

        if (this.tiles[depth] === 2) {
            this._increasePair(depth);
            this._run(depth + 1);
            this._decreasePair(depth);
            if (i < 7 && this.tiles[depth + 2] && this.tiles[depth + 1]) {
                this._increaseSyuntsu(depth);
                this._run(depth);
                this._decreaseSyuntsu(depth);
            }
        }

        if (this.tiles[depth] === 1) {
            if (i < 6 && this.tiles[depth + 1] === 1 && this.tiles[depth + 2] && this.tiles[depth + 3] !== 4) {
                this._increaseSyuntsu(depth);
                this._run(depth + 2);
                this._decreaseSyuntsu(depth);
            } else {
                this._increaseIsolatedTile(depth);
                this._run(depth + 1);
                this._decreaseIsolatedTile(depth);

                if (i < 7 && this.tiles[depth + 2]) {
                    if (this.tiles[depth + 1]) {
                        this._increaseSyuntsu(depth);
                        this._run(depth + 1);
                        this._decreaseSyuntsu(depth);
                    }
                    this._increaseTatsuSecond(depth);
                    this._run(depth + 1);
                    this._decreaseTatsuSecond(depth);
                }

                if (i < 8 && this.tiles[depth + 1]) {
                    this._increaseTatsuFirst(depth);
                    this._run(depth + 1);
                    this._decreaseTatsuFirst(depth);
                }
            }
        }
    }

    _updateResult() {
        let retShanten = 8 - this.number_melds * 2 - this.number_tatsu - this.number_pairs;
        let nMentsuKouho = this.number_melds + this.number_tatsu;
        if (this.number_pairs) {
            nMentsuKouho += this.number_pairs - 1;
        } else if (this.number_characters && this.number_isolated_tiles) {
            if ((this.number_characters | this.number_isolated_tiles) === this.number_characters) {
                retShanten += 1;
            }
        }

        if (nMentsuKouho > 4) {
            retShanten += nMentsuKouho - 4;
        }

        if (retShanten !== this.AGARI_STATE && retShanten < this.number_jidahai) {
            retShanten = this.number_jidahai;
        }

        if (retShanten < this.min_shanten) {
            this.min_shanten = retShanten;
        }
    }

    _increaseSet(k) {
        this.tiles[k] -= 3;
        this.number_melds += 1;
    }

    _decreaseSet(k) {
        this.tiles[k] += 3;
        this.number_melds -= 1;
    }

    _increasePair(k) {
        this.tiles[k] -= 2;
        this.number_pairs += 1;
    }

    _decreasePair(k) {
        this.tiles[k] += 2;
        this.number_pairs -= 1;
    }

    _increaseSyuntsu(k) {
        this.tiles[k] -= 1;
        this.tiles[k + 1] -= 1;
        this.tiles[k + 2] -= 1;
        this.number_melds += 1;
    }

    _decreaseSyuntsu(k) {
        this.tiles[k] += 1;
        this.tiles[k + 1] += 1;
        this.tiles[k + 2] += 1;
        this.number_melds -= 1;
    }

    _increaseTatsuFirst(k) {
        this.tiles[k] -= 1;
        this.tiles[k + 1] -= 1;
        this.number_tatsu += 1;
    }

    _decreaseTatsuFirst(k) {
        this.tiles[k] += 1;
        this.tiles[k + 1] += 1;
        this.number_tatsu -= 1;
    }

    _increaseTatsuSecond(k) {
        this.tiles[k] -= 1;
        this.tiles[k + 2] -= 1;
        this.number_tatsu += 1;
    }

    _decreaseTatsuSecond(k) {
        this.tiles[k] += 1;
        this.tiles[k + 2] += 1;
        this.number_tatsu -= 1;
    }

    _increaseIsolatedTile(k) {
        this.tiles[k] -= 1;
        this.number_isolated_tiles |= 1 << k;
    }

    _decreaseIsolatedTile(k) {
        this.tiles[k] += 1;
        this.number_isolated_tiles |= 1 << k;
    }

    _removeCharacterTiles(nc) {
        let number = 0;
        let isolated = 0;

        for (let i = 27; i < 34; i++) {
            if (this.tiles[i] === 4) {
                this.number_melds += 1;
                this.number_jidahai += 1;
                number |= 1 << (i - 27);
                isolated |= 1 << (i - 27);
            }

            if (this.tiles[i] === 3) {
                this.number_melds += 1;
            }

            if (this.tiles[i] === 2) {
                this.number_pairs += 1;
            }

            if (this.tiles[i] === 1) {
                isolated |= 1 << (i - 27);
            }
        }

        if (this.number_jidahai && nc % 3 === 2) {
            this.number_jidahai -= 1;
        }

        if (isolated) {
            this.number_isolated_tiles |= 1 << 27;
            if ((number | isolated) === number) {
                this.number_characters |= 1 << 27;
            }
        }
    }
}

// 常量定義
const TERMINAL_INDICES = [0, 8, 9, 17, 18, 26];
const HONOR_INDICES = [27, 28, 29, 30, 31, 32, 33];

module.exports = Shanten;
