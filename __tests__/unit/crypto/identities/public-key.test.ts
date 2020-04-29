import "jest-extended";

import { InvalidMultiSignatureAssetError, PublicKeyError } from "@arkecosystem/crypto/src/errors";
import { CryptoManager } from "@packages/crypto/src";

import { data, passphrase } from "./fixture.json";

let PublicKey;

beforeAll(() => {
    const crypto = CryptoManager.createFromPreset("devnet");
    PublicKey = crypto.Identities.PublicKey;
});

describe("Identities - Public Key", () => {
    describe("fromPassphrase", () => {
        it("should be OK", () => {
            expect(PublicKey.fromPassphrase(passphrase)).toBe(data.publicKey);
        });
    });

    describe("fromWIF", () => {
        it("should be OK", () => {
            expect(PublicKey.fromWIF(data.wif)).toBe(data.publicKey);
        });
    });

    describe("fromMultiSignatureAddress", () => {
        it("should be ok", () => {
            expect(
                PublicKey.fromMultiSignatureAsset({
                    min: 3,
                    publicKeys: ["secret 1", "secret 2", "secret 3"].map((secret) => PublicKey.fromPassphrase(secret)),
                }),
            ).toBe("0279f05076556da7173610a7676399c3620276ebbf8c67552ad3b1f26ec7627794");
        });

        it("should create the same public key for all permutations", () => {
            const publicKeySet = new Set();

            const permutations = [
                [
                    "0235d486fea0193cbe77e955ab175b8f6eb9eaf784de689beffbd649989f5d6be3",
                    "03a46f2547d20b47003c1c376788db5a54d67264df2ae914f70bf453b6a1fa1b3a",
                    "03d7dfe44e771039334f4712fb95ad355254f674c8f5d286503199157b7bf7c357",
                ],
                [
                    "0235d486fea0193cbe77e955ab175b8f6eb9eaf784de689beffbd649989f5d6be3",
                    "03d7dfe44e771039334f4712fb95ad355254f674c8f5d286503199157b7bf7c357",
                    "03a46f2547d20b47003c1c376788db5a54d67264df2ae914f70bf453b6a1fa1b3a",
                ],
                [
                    "03a46f2547d20b47003c1c376788db5a54d67264df2ae914f70bf453b6a1fa1b3a",
                    "0235d486fea0193cbe77e955ab175b8f6eb9eaf784de689beffbd649989f5d6be3",
                    "03d7dfe44e771039334f4712fb95ad355254f674c8f5d286503199157b7bf7c357",
                ],
                [
                    "03a46f2547d20b47003c1c376788db5a54d67264df2ae914f70bf453b6a1fa1b3a",
                    "03d7dfe44e771039334f4712fb95ad355254f674c8f5d286503199157b7bf7c357",
                    "0235d486fea0193cbe77e955ab175b8f6eb9eaf784de689beffbd649989f5d6be3",
                ],
                [
                    "03d7dfe44e771039334f4712fb95ad355254f674c8f5d286503199157b7bf7c357",
                    "03a46f2547d20b47003c1c376788db5a54d67264df2ae914f70bf453b6a1fa1b3a",
                    "0235d486fea0193cbe77e955ab175b8f6eb9eaf784de689beffbd649989f5d6be3",
                ],
                [
                    "03d7dfe44e771039334f4712fb95ad355254f674c8f5d286503199157b7bf7c357",
                    "0235d486fea0193cbe77e955ab175b8f6eb9eaf784de689beffbd649989f5d6be3",
                    "03a46f2547d20b47003c1c376788db5a54d67264df2ae914f70bf453b6a1fa1b3a",
                ],
            ];

            permutations.forEach((publicKeys) => {
                publicKeySet.add(
                    PublicKey.fromMultiSignatureAsset({
                        min: 2,
                        publicKeys,
                    }),
                );
            });

            expect([...publicKeySet]).toHaveLength(1);
        });

        it("should create distinct public keys for different min", () => {
            const participants = [];
            const publicKeys = new Set();

            for (let i = 1; i < 16; i++) {
                participants.push(PublicKey.fromPassphrase(`secret ${i}`));
            }

            for (let i = 1; i < 16; i++) {
                publicKeys.add(
                    PublicKey.fromMultiSignatureAsset({
                        min: i,
                        publicKeys: participants,
                    }),
                );
            }

            expect([...publicKeys]).toHaveLength(15);
        });

        it("should fail with invalid input", () => {
            expect(() => {
                PublicKey.fromMultiSignatureAsset({
                    min: 7,
                    publicKeys: ["secret 1", "secret 2", "secret 3"].map((secret) => PublicKey.fromPassphrase(secret)),
                });
            }).toThrowError(InvalidMultiSignatureAssetError);

            expect(() => {
                PublicKey.fromMultiSignatureAsset({
                    min: 1,
                    publicKeys: [],
                });
            }).toThrowError(InvalidMultiSignatureAssetError);

            expect(() => {
                PublicKey.fromMultiSignatureAsset({
                    min: 1,
                    publicKeys: ["garbage"],
                });
            }).toThrowError(PublicKeyError);
        });
    });
});
