// containerNo.ts

/**
 * ISO 6346 集装箱号校验
 * 格式：4位字母 + 7位数字
 * 例：MSCU1234567
 */

const LETTER_VALUE_MAP: Record<string, number> = {
    A: 10,
    B: 12,
    C: 13,
    D: 14,
    E: 15,
    F: 16,
    G: 17,
    H: 18,
    I: 19,
    J: 20,
    K: 21,
    L: 23,
    M: 24,
    N: 25,
    O: 26,
    P: 27,
    Q: 28,
    R: 29,
    S: 30,
    T: 31,
    U: 32,
    V: 34,
    W: 35,
    X: 36,
    Y: 37,
    Z: 38
}

/**
 * 只校验格式
 */
export function isContainerNoFormat(value: string) {
    return /^[A-Z]{4}\d{7}$/.test(value)
}

/**
 * 计算校验位
 * @param code 前10位，如：MSCU123456
 */
export function calcContainerCheckDigit(code: string) {
    if (!/^[A-Z]{4}\d{6}$/.test(code)) return null

    let sum = 0

    for (let i = 0; i < code.length; i++) {
        const char = code[i]
        const weight = Math.pow(2, i)

        let num = 0
        if (/[A-Z]/.test(char)) {
            num = LETTER_VALUE_MAP[char] || 0
        } else {
            num = Number(char)
        }

        sum += num * weight
    }

    const remainder = sum % 11
    return remainder === 10 ? 0 : remainder
}

/**
 * 严格校验集装箱号
 */
export function isValidContainerNo(value: string) {
    const no = (value || '').trim().toUpperCase()

    if (!/^[A-Z]{4}\d{7}$/.test(no)) return false
    const body = no.slice(0, 10)
    const checkDigit = Number(no[10])
    const calcDigit = calcContainerCheckDigit(body)

    return calcDigit !== null && checkDigit === calcDigit
}