import { useState, useEffect, useRef, useCallback } from 'react';

/**
 * 带错误处理和防抖的 localStorage Hook
 * @param key localStorage 键名
 * @param defaultValue 默认值
 * @param debounceDelay 防抖延迟（毫秒）
 */
export function useLocalStorage<T>(
  key: string,
  defaultValue: T,
  debounceDelay: number = 500
): [T, (value: T | ((prev: T) => T)) => void, boolean, Error | null] {
  const [error, setError] = useState<Error | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // 初始化状态 - 带错误处理
  const [storedValue, setStoredValue] = useState<T>(() => {
    try {
      const item = localStorage.getItem(key);
      if (item === null) {
        return defaultValue;
      }

      // 尝试解析 JSON
      try {
        return JSON.parse(item) as T;
      } catch {
        // 如果不是 JSON，返回原始字符串（适用于简单类型）
        return item as T;
      }
    } catch (err) {
      console.error(`Error loading localStorage key "${key}":`, err);
      setError(err instanceof Error ? err : new Error(String(err)));
      return defaultValue;
    } finally {
      setIsLoading(false);
    }
  });

  // 更新值的函数
  const setValue = useCallback((value: T | ((prev: T) => T)) => {
    try {
      // 支持函数式更新
      setStoredValue(previousValue =>
        value instanceof Function ? value(previousValue) : value
      );
      setError(null);
    } catch (err) {
      console.error(`Error setting value for key "${key}":`, err);
      setError(err instanceof Error ? err : new Error(String(err)));
    }
  }, [key]);

  // 防抖写入 localStorage
  useEffect(() => {
    if (timeoutRef.current !== null) {
      clearTimeout(timeoutRef.current);
    }

    timeoutRef.current = setTimeout(() => {
      try {
        const valueToStore = typeof storedValue === 'string'
          ? storedValue
          : JSON.stringify(storedValue);

        localStorage.setItem(key, valueToStore);
        setError(null);
      } catch (err) {
        console.error(`Error saving to localStorage key "${key}":`, err);
        setError(err instanceof Error ? err : new Error(String(err)));
      }
    }, debounceDelay);

    return () => {
      if (timeoutRef.current !== null) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [key, storedValue, debounceDelay]);

  return [storedValue, setValue, isLoading, error];
}

/**
 * 简单的数字类型 localStorage Hook（带验证）
 */
export function useLocalStorageNumber(
  key: string,
  defaultValue: number,
  debounceDelay: number = 500
): [number, (value: number | ((prev: number) => number)) => void, boolean, Error | null] {
  const [error, setError] = useState<Error | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const [storedValue, setStoredValue] = useState<number>(() => {
    try {
      const item = localStorage.getItem(key);
      if (item === null) {
        return defaultValue;
      }

      const parsed = parseInt(item, 10);
      if (isNaN(parsed)) {
        console.warn(`Invalid number in localStorage key "${key}", using default`);
        return defaultValue;
      }
      return parsed;
    } catch (err) {
      console.error(`Error loading localStorage key "${key}":`, err);
      setError(err instanceof Error ? err : new Error(String(err)));
      return defaultValue;
    } finally {
      setIsLoading(false);
    }
  });

  const setValue = useCallback((value: number | ((prev: number) => number)) => {
    try {
      setStoredValue(previousValue => {
        const valueToStore = value instanceof Function ? value(previousValue) : value;

        if (typeof valueToStore !== 'number' || !Number.isFinite(valueToStore)) {
          throw new Error(`Invalid number value: ${valueToStore}`);
        }

        return valueToStore;
      });
      setError(null);
    } catch (err) {
      console.error(`Error setting value for key "${key}":`, err);
      setError(err instanceof Error ? err : new Error(String(err)));
    }
  }, [key]);

  useEffect(() => {
    if (timeoutRef.current !== null) {
      clearTimeout(timeoutRef.current);
    }

    timeoutRef.current = setTimeout(() => {
      try {
        localStorage.setItem(key, storedValue.toString());
        setError(null);
      } catch (err) {
        console.error(`Error saving to localStorage key "${key}":`, err);
        setError(err instanceof Error ? err : new Error(String(err)));
      }
    }, debounceDelay);

    return () => {
      if (timeoutRef.current !== null) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [key, storedValue, debounceDelay]);

  return [storedValue, setValue, isLoading, error];
}
