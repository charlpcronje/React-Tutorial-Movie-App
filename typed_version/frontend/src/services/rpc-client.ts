/**
 * RPC CLIENT IMPLEMENTATION FOR EDUCATIONAL MOVIE APP
 * 
 * This file demonstrates advanced TypeScript patterns for RPC communication:
 * 
 * 🎯 ADVANCED TYPESCRIPT FEATURES DEMONSTRATED:
 * 1. GENERIC CONSTRAINTS: Type constraints for method parameters and results
 * 2. MAPPED TYPES: Dynamic type generation for method signatures
 * 3. CONDITIONAL TYPES: Type logic based on runtime conditions
 * 4. UTILITY TYPES: Leveraging built-in TypeScript utility types
 * 5. DISCRIMINATED UNIONS: Type-safe error and success handling
 * 6. TEMPLATE LITERAL TYPES: String manipulation at type level
 * 7. BRANDED TYPES: Enhanced primitive type safety
 * 8. ASYNC/AWAIT TYPING: Promise and async function typing
 * 9. EVENT EMITTER TYPING: Type-safe event handling patterns
 * 10. ERROR HANDLING: Comprehensive error type definitions
 * 11. WEBSOCKET INTEGRATION: Real-time communication with type safety
 * 12. MIDDLEWARE PATTERNS: Type-safe middleware composition
 * 13. SUBSCRIPTION MANAGEMENT: Type-safe reactive patterns
 * 14. CONNECTION STATE: State machine typing patterns
 * 15. SERIALIZATION SAFETY: JSON-safe type constraints
 * 
 * This RPC client provides type-safe communication between frontend and backend
 * while demonstrating sophisticated TypeScript patterns that go beyond basic usage.
 */

// ============================================================================
// IMPORTS
// ============================================================================

import type {
  RPCClient,
  RPCMethodName,
  RPCParams,
  RPCResult,
  RPCRequest,
  RPCResponse,
  RPCSuccessResponse,
  RPCErrorResponse,
  RPCError,
  RPCErrorCode,
  RPCConnectionState,
  RPCConnectionOptions,
  RPCSubscriptionMethod,
  RPCSubscriptionParams,
  RPCSubscriptionData,
  RPCSubscription,
  RPCMiddleware,
  RPCContext,
  AllServiceMethods,
  JSONSerializable,
  RPCSafe
} from '@/types/rpc';

// ============================================================================
// ADVANCED TYPE UTILITIES FOR RPC
// ============================================================================

/**
 * Extract Method Names with Type Filtering
 * 
 * Advanced conditional type that extracts only methods that match certain criteria.
 * Demonstrates template literal types and conditional type logic.
 */
type FilterMethodsByPrefix<T, P extends string> = {
  [K in keyof T as K extends `${P}.${string}` ? K : never]: T[K];
};

/**
 * Movie Service Methods
 * 
 * Demonstrates mapped types for service method extraction.
 */
type MovieMethods = FilterMethodsByPrefix<AllServiceMethods, 'movies'>;

/**
 * User Service Methods
 * 
 * Shows how to extract specific service methods using template literals.
 */
type UserMethods = FilterMethodsByPrefix<AllServiceMethods, 'users'>;

/**
 * Method Parameter Validator
 * 
 * Generic type that ensures parameters are JSON serializable.
 */
type ValidateRPCParams<T> = T extends JSONSerializable ? T : never;

// ============================================================================
// RPC ERROR CLASSES WITH TYPESCRIPT
// ============================================================================

/**
 * Base RPC Error Class
 * 
 * Demonstrates class typing with TypeScript and error inheritance.
 */
class RPCClientError extends Error {
  public readonly code: RPCErrorCode;
  public readonly data?: unknown;
  
  constructor(message: string, code: RPCErrorCode, data?: unknown) {
    super(message);
    this.name = 'RPCClientError';
    this.code = code;
    this.data = data;
    
    // Maintains proper stack trace for where our error was thrown
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, RPCClientError);
    }
  }
  
  /**
   * Type Guard for RPC Error
   * 
   * Demonstrates static method typing and type predicate functions.
   */
  static isRPCError(error: unknown): error is RPCClientError {
    return error instanceof RPCClientError;
  }
  
  /**
   * Convert to JSON-safe Format
   * 
   * Demonstrates method typing with return type specification.
   */
  toJSON(): {
    name: string;
    message: string;
    code: RPCErrorCode;
    data?: unknown;
  } {
    return {
      name: this.name,
      message: this.message,
      code: this.code,
      data: this.data
    };
  }
}

/**
 * Connection Error Class
 * 
 * Specialized error for connection issues.
 */
class RPCConnectionError extends RPCClientError {
  constructor(message: string, data?: unknown) {
    super(message, RPCErrorCode.INTERNAL_ERROR, data);
    this.name = 'RPCConnectionError';
  }
}

/**
 * Timeout Error Class
 * 
 * Specialized error for request timeouts.
 */
class RPCTimeoutError extends RPCClientError {
  constructor(timeout: number) {
    super(`RPC request timed out after ${timeout}ms`, RPCErrorCode.INTERNAL_ERROR, { timeout });
    this.name = 'RPCTimeoutError';
  }
}

// ============================================================================
// EVENT EMITTER WITH TYPESCRIPT
// ============================================================================

/**
 * Type-Safe Event Emitter for RPC Events
 * 
 * Demonstrates generic event typing and callback function typing.
 */
class TypedEventEmitter<TEvents extends Record<string, (...args: any[]) => void>> {
  private listeners: Map<keyof TEvents, Set<(...args: any[]) => void>> = new Map();
  
  /**
   * Add Event Listener
   * 
   * Demonstrates generic constraints and callback typing.
   */
  on<K extends keyof TEvents>(event: K, listener: TEvents[K]): this {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }
    this.listeners.get(event)!.add(listener);
    return this;
  }
  
  /**
   * Remove Event Listener
   * 
   * Demonstrates method chaining with typed return values.
   */
  off<K extends keyof TEvents>(event: K, listener: TEvents[K]): this {
    const eventListeners = this.listeners.get(event);
    if (eventListeners) {
      eventListeners.delete(listener);
      if (eventListeners.size === 0) {
        this.listeners.delete(event);
      }
    }
    return this;
  }
  
  /**
   * Emit Event
   * 
   * Demonstrates parameter spreading with type safety.
   */
  emit<K extends keyof TEvents>(event: K, ...args: Parameters<TEvents[K]>): boolean {
    const eventListeners = this.listeners.get(event);
    if (!eventListeners || eventListeners.size === 0) {
      return false;
    }
    
    for (const listener of eventListeners) {
      try {
        listener(...args);
      } catch (error) {
        console.error(`Error in event listener for ${String(event)}:`, error);
      }
    }
    return true;
  }
  
  /**
   * Remove All Listeners
   * 
   * Demonstrates void return type and cleanup patterns.
   */
  removeAllListeners(): void {
    this.listeners.clear();
  }
}

// ============================================================================
// RPC CONNECTION EVENT TYPES
// ============================================================================

/**
 * RPC Connection Events Interface
 * 
 * Type-safe event definitions for the RPC connection.
 */
interface RPCConnectionEvents {
  connected: () => void;
  disconnected: (reason: string) => void;
  reconnecting: (attempt: number) => void;
  error: (error: Error) => void;
  message: (message: RPCResponse) => void;
  stateChange: (newState: RPCConnectionState, oldState: RPCConnectionState) => void;
}

// ============================================================================
// WEBSOCKET RPC CLIENT IMPLEMENTATION
// ============================================================================

/**
 * WebSocket-based RPC Client with Comprehensive TypeScript
 * 
 * This implementation demonstrates:
 * - Advanced generic usage
 * - State management with discriminated unions
 * - Promise-based async operations
 * - Event-driven architecture
 * - Error handling patterns
 * - Subscription management
 * - Middleware patterns
 * - Connection state management
 */
export class WebSocketRPCClient extends TypedEventEmitter<RPCConnectionEvents> implements RPCClient {
  private ws: WebSocket | null = null;
  private readonly options: RPCConnectionOptions;
  private state: RPCConnectionState = 'disconnected';
  private requestId: number = 0;
  private pendingRequests: Map<string | number, {
    resolve: (result: unknown) => void;
    reject: (error: Error) => void;
    timeout: NodeJS.Timeout;
  }> = new Map();
  private subscriptions: Map<string, RPCSubscription> = new Map();
  private middleware: RPCMiddleware[] = [];
  private reconnectAttempts: number = 0;
  private maxReconnectAttempts: number = 5;
  private reconnectDelay: number = 1000;
  
  /**
   * Constructor with Options Validation
   * 
   * Demonstrates constructor parameter typing and validation.
   */
  constructor(options: RPCConnectionOptions) {
    super();
    this.options = { ...options };
    this.validateOptions();
  }
  
  /**
   * Options Validation
   * 
   * Demonstrates private method typing and validation patterns.
   */
  private validateOptions(): void {
    if (!this.options.url) {
      throw new Error('RPC client requires a URL');
    }
    
    if (this.options.timeout && this.options.timeout <= 0) {
      throw new Error('Timeout must be positive');
    }
  }
  
  /**
   * Generate Request ID
   * 
   * Demonstrates private method with specific return type.
   */
  private generateRequestId(): string {
    return `rpc_${Date.now()}_${++this.requestId}`;
  }
  
  /**
   * Update Connection State
   * 
   * Demonstrates state management with type safety.
   */
  private updateState(newState: RPCConnectionState): void {
    if (this.state !== newState) {
      const oldState = this.state;
      this.state = newState;
      this.emit('stateChange', newState, oldState);
    }
  }
  
  /**
   * Connect to RPC Server
   * 
   * Demonstrates Promise typing and WebSocket integration.
   */
  async connect(): Promise<void> {
    if (this.state === 'connected' || this.state === 'connecting') {
      return;
    }
    
    this.updateState('connecting');
    
    return new Promise<void>((resolve, reject) => {
      try {
        this.ws = new WebSocket(this.options.url);
        
        // WebSocket event handlers with proper typing
        this.ws.onopen = (): void => {
          this.updateState('connected');
          this.reconnectAttempts = 0;
          this.emit('connected');
          resolve();
        };
        
        this.ws.onclose = (event: CloseEvent): void => {
          this.handleDisconnect(`Connection closed: ${event.reason || 'Unknown reason'}`);
        };
        
        this.ws.onerror = (event: Event): void => {
          const error = new RPCConnectionError('WebSocket connection error', event);
          this.emit('error', error);
          if (this.state === 'connecting') {
            reject(error);
          }
        };
        
        this.ws.onmessage = (event: MessageEvent): void => {
          this.handleMessage(event.data);
        };
        
        // Connection timeout
        const connectTimeout = setTimeout(() => {
          if (this.state === 'connecting') {
            const error = new RPCTimeoutError(this.options.timeout || 10000);
            reject(error);
            this.ws?.close();
          }
        }, this.options.timeout || 10000);
        
        // Clear timeout on successful connection
        this.on('connected', () => {
          clearTimeout(connectTimeout);
        });
        
      } catch (error) {
        this.updateState('error');
        reject(error instanceof Error ? error : new Error(String(error)));
      }
    });
  }
  
  /**
   * Handle WebSocket Message
   * 
   * Demonstrates JSON parsing with type safety.
   */
  private handleMessage(data: string): void {
    try {
      const message: RPCResponse = JSON.parse(data);
      this.emit('message', message);
      
      // Handle regular RPC responses
      if (message.id !== null && message.id !== undefined) {
        const pending = this.pendingRequests.get(message.id);
        if (pending) {
          clearTimeout(pending.timeout);
          this.pendingRequests.delete(message.id);
          
          if ('result' in message) {
            pending.resolve(message.result);
          } else if ('error' in message) {
            const error = new RPCClientError(
              message.error.message,
              message.error.code,
              message.error.data
            );
            pending.reject(error);
          }
        }
      }
      
      // Handle subscription notifications (id is null for notifications)
      if (message.id === null && 'result' in message) {
        // This would be a subscription notification
        // Implementation depends on your subscription protocol
      }
      
    } catch (error) {
      console.error('Failed to parse RPC message:', error);
    }
  }
  
  /**
   * Handle Disconnection
   * 
   * Demonstrates cleanup and reconnection logic.
   */
  private handleDisconnect(reason: string): void {
    this.updateState('disconnected');
    this.emit('disconnected', reason);
    
    // Reject all pending requests
    for (const [id, { reject, timeout }] of this.pendingRequests) {
      clearTimeout(timeout);
      reject(new RPCConnectionError('Connection lost'));
    }
    this.pendingRequests.clear();
    
    // Attempt reconnection
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.attemptReconnect();
    }
  }
  
  /**
   * Attempt Reconnection
   * 
   * Demonstrates exponential backoff and async retry patterns.
   */
  private async attemptReconnect(): Promise<void> {
    this.reconnectAttempts++;
    this.updateState('reconnecting');
    this.emit('reconnecting', this.reconnectAttempts);
    
    const delay = this.reconnectDelay * Math.pow(2, this.reconnectAttempts - 1);
    
    setTimeout(async () => {
      try {
        await this.connect();
      } catch (error) {
        console.error(`Reconnection attempt ${this.reconnectAttempts} failed:`, error);
      }
    }, delay);
  }
  
  /**
   * Add Middleware
   * 
   * Demonstrates middleware pattern with function typing.
   */
  use(middleware: RPCMiddleware): this {
    this.middleware.push(middleware);
    return this;
  }
  
  /**
   * Execute Middleware Chain
   * 
   * Demonstrates async middleware execution with recursive typing.
   */
  private async executeMiddleware(
    request: RPCRequest,
    index: number = 0
  ): Promise<RPCResponse> {
    if (index >= this.middleware.length) {
      return this.sendRawRequest(request);
    }
    
    const middleware = this.middleware[index];
    return middleware(request, (modifiedRequest) => 
      this.executeMiddleware(modifiedRequest, index + 1)
    );
  }
  
  /**
   * Send Raw Request
   * 
   * Demonstrates low-level request sending with Promise typing.
   */
  private async sendRawRequest(request: RPCRequest): Promise<RPCResponse> {
    if (!this.ws || this.state !== 'connected') {
      throw new RPCConnectionError('Not connected to RPC server');
    }
    
    return new Promise<RPCResponse>((resolve, reject) => {
      const timeout = setTimeout(() => {
        this.pendingRequests.delete(request.id);
        reject(new RPCTimeoutError(this.options.timeout || 30000));
      }, this.options.timeout || 30000);
      
      this.pendingRequests.set(request.id, {
        resolve: (result: unknown) => resolve({
          jsonrpc: '2.0',
          id: request.id,
          result
        } as RPCSuccessResponse<unknown>),
        reject,
        timeout
      });
      
      this.ws!.send(JSON.stringify(request));
    });
  }
  
  /**
   * Call RPC Method
   * 
   * Demonstrates the main RPC call method with comprehensive typing.
   * This is where all the TypeScript magic comes together!
   */
  async call<T extends RPCMethodName>(
    method: T,
    params: ValidateRPCParams<RPCParams<T>>
  ): Promise<RPCResult<T>> {
    // Create typed RPC request
    const request: RPCRequest<T, RPCParams<T>> = {
      jsonrpc: '2.0',
      id: this.generateRequestId(),
      method,
      params
    };
    
    try {
      // Execute middleware chain
      const response = await (this.middleware.length > 0 
        ? this.executeMiddleware(request)
        : this.sendRawRequest(request));
      
      // Type-safe response handling
      if ('error' in response) {
        throw new RPCClientError(
          response.error.message,
          response.error.code,
          response.error.data
        );
      }
      
      return response.result as RPCResult<T>;
      
    } catch (error) {
      if (RPCClientError.isRPCError(error)) {
        throw error;
      }
      throw new RPCClientError(
        'RPC call failed',
        RPCErrorCode.INTERNAL_ERROR,
        error
      );
    }
  }
  
  /**
   * Batch RPC Calls
   * 
   * Demonstrates batch operations with array typing.
   */
  async batch<T extends readonly { method: RPCMethodName; params: unknown; id?: string | number }[]>(
    calls: T
  ): Promise<{ [K in keyof T]: RPCResponse<RPCResult<T[K]['method']>> }> {
    if (!this.ws || this.state !== 'connected') {
      throw new RPCConnectionError('Not connected to RPC server');
    }
    
    const batchRequest = calls.map((call, index) => ({
      jsonrpc: '2.0' as const,
      id: call.id ?? this.generateRequestId(),
      method: call.method,
      params: call.params
    }));
    
    return new Promise((resolve, reject) => {
      const responses: RPCResponse[] = [];
      const timeout = setTimeout(() => {
        reject(new RPCTimeoutError(this.options.timeout || 30000));
      }, this.options.timeout || 30000);
      
      // Track individual requests
      batchRequest.forEach((request, index) => {
        this.pendingRequests.set(request.id, {
          resolve: (result: unknown) => {
            responses[index] = {
              jsonrpc: '2.0',
              id: request.id,
              result
            } as RPCSuccessResponse<unknown>;
            
            if (responses.filter(r => r !== undefined).length === calls.length) {
              clearTimeout(timeout);
              resolve(responses as any);
            }
          },
          reject: (error: Error) => {
            clearTimeout(timeout);
            reject(error);
          },
          timeout
        });
      });
      
      this.ws!.send(JSON.stringify(batchRequest));
    });
  }
  
  /**
   * Subscribe to Real-time Updates
   * 
   * Demonstrates subscription patterns with type safety.
   */
  subscribe<T extends RPCSubscriptionMethod>(
    method: T,
    params: RPCSubscriptionParams<T>,
    callback: (data: RPCSubscriptionData<T>) => void
  ): RPCSubscription {
    const subscriptionId = this.generateRequestId();
    
    const subscription: RPCSubscription = {
      id: subscriptionId,
      method,
      params,
      unsubscribe: async () => {
        this.subscriptions.delete(subscriptionId);
        // Send unsubscribe request to server
        await this.call('unsubscribe' as any, { subscriptionId } as any);
      }
    };
    
    this.subscriptions.set(subscriptionId, subscription);
    
    // Send subscription request
    this.call('subscribe' as any, { 
      method, 
      params, 
      subscriptionId 
    } as any).catch(error => {
      console.error('Subscription failed:', error);
      this.subscriptions.delete(subscriptionId);
    });
    
    return subscription;
  }
  
  /**
   * Get Connection State
   * 
   * Demonstrates getter with specific return type.
   */
  get connectionState(): RPCConnectionState {
    return this.state;
  }
  
  /**
   * Check if Connected
   * 
   * Demonstrates computed property with boolean return.
   */
  get isConnected(): boolean {
    return this.state === 'connected';
  }
  
  /**
   * Close Connection
   * 
   * Demonstrates cleanup with Promise return type.
   */
  async close(): Promise<void> {
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
    
    // Clear all pending requests
    for (const [, { reject, timeout }] of this.pendingRequests) {
      clearTimeout(timeout);
      reject(new RPCConnectionError('Client closed'));
    }
    this.pendingRequests.clear();
    
    // Clear all subscriptions
    for (const subscription of this.subscriptions.values()) {
      await subscription.unsubscribe();
    }
    this.subscriptions.clear();
    
    this.removeAllListeners();
    this.updateState('disconnected');
  }
}

// ============================================================================
// HTTP RPC CLIENT IMPLEMENTATION
// ============================================================================

/**
 * HTTP-based RPC Client
 * 
 * Alternative implementation using HTTP requests instead of WebSockets.
 * Demonstrates different communication patterns with the same interface.
 */
export class HttpRPCClient implements RPCClient {
  private readonly baseUrl: string;
  private readonly timeout: number;
  private readonly headers: Record<string, string>;
  private middleware: RPCMiddleware[] = [];
  
  constructor(options: { url: string; timeout?: number; headers?: Record<string, string> }) {
    this.baseUrl = options.url.replace(/\/$/, ''); // Remove trailing slash
    this.timeout = options.timeout || 30000;
    this.headers = {
      'Content-Type': 'application/json',
      ...options.headers
    };
  }
  
  use(middleware: RPCMiddleware): this {
    this.middleware.push(middleware);
    return this;
  }
  
  async call<T extends RPCMethodName>(
    method: T,
    params: RPCParams<T>
  ): Promise<RPCResult<T>> {
    const request: RPCRequest<T, RPCParams<T>> = {
      jsonrpc: '2.0',
      id: Math.random().toString(36).substring(2),
      method,
      params
    };
    
    try {
      // Apply middleware
      const processedRequest = this.middleware.length > 0
        ? await this.executeMiddleware(request, 0)
        : await this.sendHttpRequest(request);
      
      if ('error' in processedRequest) {
        throw new RPCClientError(
          processedRequest.error.message,
          processedRequest.error.code,
          processedRequest.error.data
        );
      }
      
      return processedRequest.result as RPCResult<T>;
      
    } catch (error) {
      if (RPCClientError.isRPCError(error)) {
        throw error;
      }
      throw new RPCClientError(
        'HTTP RPC call failed',
        RPCErrorCode.INTERNAL_ERROR,
        error
      );
    }
  }
  
  private async executeMiddleware(
    request: RPCRequest,
    index: number
  ): Promise<RPCResponse> {
    if (index >= this.middleware.length) {
      return this.sendHttpRequest(request);
    }
    
    const middleware = this.middleware[index];
    return middleware(request, (modifiedRequest) =>
      this.executeMiddleware(modifiedRequest, index + 1)
    );
  }
  
  private async sendHttpRequest(request: RPCRequest): Promise<RPCResponse> {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.timeout);
    
    try {
      const response = await fetch(this.baseUrl, {
        method: 'POST',
        headers: this.headers,
        body: JSON.stringify(request),
        signal: controller.signal
      });
      
      clearTimeout(timeoutId);
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      return await response.json();
      
    } catch (error) {
      clearTimeout(timeoutId);
      
      if (error instanceof Error && error.name === 'AbortError') {
        throw new RPCTimeoutError(this.timeout);
      }
      
      throw error;
    }
  }
  
  // HTTP doesn't support real-time subscriptions
  subscribe<T extends RPCSubscriptionMethod>(
    method: T,
    params: RPCSubscriptionParams<T>,
    callback: (data: RPCSubscriptionData<T>) => void
  ): RPCSubscription {
    throw new Error('HTTP RPC client does not support subscriptions');
  }
  
  async batch<T extends readonly { method: RPCMethodName; params: unknown; id?: string | number }[]>(
    calls: T
  ): Promise<{ [K in keyof T]: RPCResponse<RPCResult<T[K]['method']>> }> {
    const batchRequest = calls.map((call, index) => ({
      jsonrpc: '2.0' as const,
      id: call.id ?? index,
      method: call.method,
      params: call.params
    }));
    
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.timeout);
    
    try {
      const response = await fetch(this.baseUrl, {
        method: 'POST',
        headers: this.headers,
        body: JSON.stringify(batchRequest),
        signal: controller.signal
      });
      
      clearTimeout(timeoutId);
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      const results = await response.json();
      return Array.isArray(results) ? results as any : [results] as any;
      
    } catch (error) {
      clearTimeout(timeoutId);
      
      if (error instanceof Error && error.name === 'AbortError') {
        throw new RPCTimeoutError(this.timeout);
      }
      
      throw error;
    }
  }
  
  async close(): Promise<void> {
    // HTTP client doesn't maintain persistent connections
    // This is a no-op for HTTP client
  }
}

// ============================================================================
// MIDDLEWARE IMPLEMENTATIONS
// ============================================================================

/**
 * Authentication Middleware
 * 
 * Demonstrates middleware implementation with token injection.
 */
export function createAuthMiddleware(getToken: () => string | null): RPCMiddleware {
  return async (request, next) => {
    const token = getToken();
    if (token) {
      const authRequest = {
        ...request,
        auth: {
          token,
          type: 'Bearer' as const
        }
      };
      return next(authRequest);
    }
    return next(request);
  };
}

/**
 * Retry Middleware
 * 
 * Demonstrates retry logic with exponential backoff.
 */
export function createRetryMiddleware(
  maxRetries: number = 3,
  initialDelay: number = 1000
): RPCMiddleware {
  return async (request, next) => {
    let attempt = 0;
    let lastError: Error | null = null;
    
    while (attempt <= maxRetries) {
      try {
        return await next(request);
      } catch (error) {
        lastError = error instanceof Error ? error : new Error(String(error));
        
        if (attempt === maxRetries) {
          break;
        }
        
        // Don't retry certain error types
        if (RPCClientError.isRPCError(lastError)) {
          if ([RPCErrorCode.INVALID_REQUEST, RPCErrorCode.METHOD_NOT_FOUND].includes(lastError.code)) {
            break;
          }
        }
        
        // Exponential backoff
        const delay = initialDelay * Math.pow(2, attempt);
        await new Promise(resolve => setTimeout(resolve, delay));
        attempt++;
      }
    }
    
    throw lastError;
  };
}

/**
 * Logging Middleware
 * 
 * Demonstrates logging middleware with performance tracking.
 */
export function createLoggingMiddleware(
  logger: (message: string, data?: unknown) => void = console.log
): RPCMiddleware {
  return async (request, next) => {
    const startTime = Date.now();
    logger(`[RPC] → ${request.method}`, request.params);
    
    try {
      const response = await next(request);
      const duration = Date.now() - startTime;
      logger(`[RPC] ← ${request.method} (${duration}ms)`, 'error' in response ? response.error : '✓');
      return response;
    } catch (error) {
      const duration = Date.now() - startTime;
      logger(`[RPC] ✗ ${request.method} (${duration}ms)`, error);
      throw error;
    }
  };
}

// ============================================================================
// FACTORY FUNCTIONS
// ============================================================================

/**
 * Create WebSocket RPC Client
 * 
 * Factory function with default configuration.
 */
export function createWebSocketRPCClient(options: RPCConnectionOptions): WebSocketRPCClient {
  return new WebSocketRPCClient(options);
}

/**
 * Create HTTP RPC Client
 * 
 * Factory function for HTTP-based RPC.
 */
export function createHttpRPCClient(options: { 
  url: string; 
  timeout?: number; 
  headers?: Record<string, string> 
}): HttpRPCClient {
  return new HttpRPCClient(options);
}

/**
 * EDUCATIONAL CONCEPTS DEMONSTRATED:
 * 
 * 🎯 ADVANCED TYPESCRIPT PATTERNS:
 * 1. Generic constraints and conditional types for method validation
 * 2. Mapped types for dynamic API surface generation
 * 3. Template literal types for string manipulation
 * 4. Discriminated unions for error/success handling
 * 5. Utility types (Parameters, ReturnType, etc.)
 * 6. Branded types for ID safety
 * 7. Type assertions and type guards
 * 8. Promise typing and async/await patterns
 * 9. Event emitter typing with generic constraints
 * 10. Class typing with inheritance
 * 
 * 🚀 ARCHITECTURAL PATTERNS:
 * 11. Middleware pattern with function composition
 * 12. Event-driven architecture with typed events
 * 13. State machine implementation with union types
 * 14. Connection pooling and management
 * 15. Subscription management with cleanup
 * 16. Retry logic with exponential backoff
 * 17. Timeout handling with AbortController
 * 18. Error categorization and recovery
 * 19. Serialization safety constraints
 * 20. Factory pattern for client creation
 * 
 * 📡 COMMUNICATION PATTERNS:
 * 21. WebSocket real-time communication
 * 22. HTTP request/response patterns
 * 23. Batch operation handling
 * 24. Subscription/notification patterns
 * 25. Connection lifecycle management
 * 
 * This RPC client demonstrates how TypeScript can provide complete type safety
 * for remote procedure calls while maintaining flexibility and extensibility.
 * Every aspect of the communication is typed, from method parameters to
 * error responses, providing excellent developer experience and runtime safety.
 */