/**
 * User Entity Tests
 * Basic tests for the User entity structure and properties
 */
import { User } from '../../../src/users/entities/user.entity';

describe('User Entity', () => {
  it('should create a user entity with valid data', () => {
    const user = new User();
    user.name = 'John Doe';
    user.email = 'john.doe@example.com';
    user.createdAt = new Date('2024-01-15T10:30:00.000Z');

    expect(user).toBeDefined();
    expect(user.name).toBe('John Doe');
    expect(user.email).toBe('john.doe@example.com');
    expect(user.createdAt).toBeInstanceOf(Date);
  });

  it('should have all required properties', () => {
    const user = new User();
    user.id = 1;
    user.name = 'Test User';
    user.email = 'test@example.com';
    user.createdAt = new Date();

    expect(user).toHaveProperty('id');
    expect(user).toHaveProperty('name');
    expect(user).toHaveProperty('email');
    expect(user).toHaveProperty('createdAt');
  });

  it('should be serializable to JSON', () => {
    const user = new User();
    user.id = 1;
    user.name = 'JSON Test User';
    user.email = 'json.test@example.com';
    user.createdAt = new Date('2024-01-15T10:30:00.000Z');

    const json = JSON.stringify(user);
    const parsed = JSON.parse(json);

    expect(parsed.id).toBe(1);
    expect(parsed.name).toBe('JSON Test User');
    expect(parsed.email).toBe('json.test@example.com');
  });
});