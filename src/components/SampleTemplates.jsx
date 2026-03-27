import React, { useState } from 'react';

/**
 * Sample code templates organized by language.
 * Each template has a name, description, and code.
 */
const TEMPLATES = {
  python: [
    {
      name: 'Binary Search',
      desc: 'Search a sorted array in O(log n)',
      code: `def binary_search(arr, target):
    left, right = 0, len(arr) - 1
    while left <= right:
        mid = (left + right) // 2
        if arr[mid] == target:
            return mid
        elif arr[mid] < target:
            left = mid + 1
        else:
            right = mid - 1
    return -1

# Example
arr = [1, 3, 5, 7, 9, 11, 13]
result = binary_search(arr, 7)`,
    },
    {
      name: 'Fibonacci',
      desc: 'Recursive Fibonacci with base cases',
      code: `def fibonacci(n):
    if n <= 0:
        return 0
    if n == 1:
        return 1
    return fibonacci(n - 1) + fibonacci(n - 2)

# Example
result = fibonacci(6)`,
    },
    {
      name: 'Bubble Sort',
      desc: 'Simple sorting algorithm',
      code: `def bubble_sort(arr):
    n = len(arr)
    for i in range(n):
        for j in range(0, n - i - 1):
            if arr[j] > arr[j + 1]:
                arr[j], arr[j + 1] = arr[j + 1], arr[j]
    return arr

# Example
arr = [64, 34, 25, 12, 22, 11, 90]
result = bubble_sort(arr)`,
    },
    {
      name: 'Two Sum',
      desc: 'Find two numbers that add to target',
      code: `def two_sum(nums, target):
    seen = {}
    for i, num in enumerate(nums):
        complement = target - num
        if complement in seen:
            return [seen[complement], i]
        seen[num] = i
    return []

# Example
nums = [2, 7, 11, 15]
result = two_sum(nums, 9)`,
    },
  ],
  javascript: [
    {
      name: 'Array Filter & Map',
      desc: 'Functional array operations',
      code: `const numbers = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];

// Filter even numbers and double them
const result = numbers
  .filter(n => n % 2 === 0)
  .map(n => n * 2);

console.log(result);`,
    },
    {
      name: 'Binary Search',
      desc: 'Iterative binary search',
      code: `function binarySearch(arr, target) {
  let left = 0;
  let right = arr.length - 1;
  while (left <= right) {
    const mid = Math.floor((left + right) / 2);
    if (arr[mid] === target) return mid;
    if (arr[mid] < target) left = mid + 1;
    else right = mid - 1;
  }
  return -1;
}

const arr = [1, 3, 5, 7, 9, 11];
const result = binarySearch(arr, 7);`,
    },
    {
      name: 'Fibonacci',
      desc: 'Dynamic programming approach',
      code: `function fibonacci(n) {
  if (n <= 1) return n;
  let a = 0, b = 1;
  for (let i = 2; i <= n; i++) {
    let temp = a + b;
    a = b;
    b = temp;
  }
  return b;
}

const result = fibonacci(10);
console.log(result);`,
    },
  ],
  java: [
    {
      name: 'Binary Search',
      desc: 'Classic iterative search',
      code: `public class Main {
    static int binarySearch(int[] arr, int target) {
        int left = 0, right = arr.length - 1;
        while (left <= right) {
            int mid = left + (right - left) / 2;
            if (arr[mid] == target) return mid;
            if (arr[mid] < target) left = mid + 1;
            else right = mid - 1;
        }
        return -1;
    }

    public static void main(String[] args) {
        int[] arr = {1, 3, 5, 7, 9, 11};
        int result = binarySearch(arr, 7);
        System.out.println(result);
    }
}`,
    },
    {
      name: 'Stack Operations',
      desc: 'Push, pop, and peek using array',
      code: `public class Main {
    static int[] stack = new int[100];
    static int top = -1;

    static void push(int val) {
        stack[++top] = val;
    }

    static int pop() {
        return stack[top--];
    }

    public static void main(String[] args) {
        push(10);
        push(20);
        push(30);
        int val = pop();
        System.out.println(val);
    }
}`,
    },
  ],
  c: [
    {
      name: 'Two Pointer',
      desc: 'Find pair with given sum',
      code: `#include <stdio.h>

int findPair(int arr[], int n, int target) {
    int left = 0, right = n - 1;
    while (left < right) {
        int sum = arr[left] + arr[right];
        if (sum == target) return 1;
        if (sum < target) left++;
        else right--;
    }
    return 0;
}

int main() {
    int arr[] = {1, 2, 3, 4, 5, 6};
    int result = findPair(arr, 6, 9);
    printf("%d\\n", result);
    return 0;
}`,
    },
    {
      name: 'Insertion Sort',
      desc: 'Sort array using insertions',
      code: `#include <stdio.h>

void insertionSort(int arr[], int n) {
    for (int i = 1; i < n; i++) {
        int key = arr[i];
        int j = i - 1;
        while (j >= 0 && arr[j] > key) {
            arr[j + 1] = arr[j];
            j--;
        }
        arr[j + 1] = key;
    }
}

int main() {
    int arr[] = {12, 11, 13, 5, 6};
    insertionSort(arr, 5);
    for (int i = 0; i < 5; i++)
        printf("%d ", arr[i]);
    return 0;
}`,
    },
  ],
};

const SampleTemplates = ({ lang, onSelect, onClose }) => {
  const templates = TEMPLATES[lang] || TEMPLATES.python;

  return (
    <div className="templates-overlay" onClick={onClose}>
      <div className="templates-modal" onClick={(e) => e.stopPropagation()}>
        <div className="templates-header">
          <h3>📋 Sample Templates</h3>
          <span className="templates-lang-badge">{lang}</span>
          <button className="templates-close" onClick={onClose}>✕</button>
        </div>
        <div className="templates-grid">
          {templates.map((t, i) => (
            <div
              key={i}
              className="template-card"
              onClick={() => { onSelect(t.code); onClose(); }}
            >
              <div className="template-name">{t.name}</div>
              <div className="template-desc">{t.desc}</div>
              <pre className="template-preview">{t.code.slice(0, 80)}…</pre>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default SampleTemplates;
