import { User } from '../../../src/users/entities/user.entity';

describe('User Entity', () => {
  describe('Entity Creation', () => {
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

    it('should create user entity without id (auto-generated)', () => {
      const user = new User();
      user.name = 'Jane Doe';
      user.email = 'jane.doe@example.com';

      expect(user.id).toBeUndefined();
      expect(user.name).toBe('Jane Doe');
      expect(user.email).toBe('jane.doe@example.com');
    });

    it('should handle special characters in name', () => {
      const user = new User();
      user.name = 'José María O\'Connor-Smith';
      user.email = 'jose.maria@example.com';

      expect(user.name).toBe('José María O\'Connor-Smith');
    });

    it('should handle international email domains', () => {
      const user = new User();
      user.name = 'Test User';
      user.email = 'test@example.co.uk';

      expect(user.email).toBe('test@example.co.uk');
    });
  });

  describe('Entity Properties', () => {
    let user: User;

    beforeEach(() => {
      user = new User();
      user.name = 'Test User';
      user.email = 'test@example.com';
      user.createdAt = new Date();
    });

    it('should have id property', () => {
      expect(user).toHaveProperty('id');
    });

    it('should have name property', () => {
      expect(user).toHaveProperty('name');
      expect(user.name).toBe('Test User');
    });

    it('should have email property', () => {
      expect(user).toHaveProperty('email');
      expect(user.email).toBe('test@example.com');
    });

    it('should have createdAt property', () => {
      expect(user).toHaveProperty('createdAt');
      expect(user.createdAt).toBeInstanceOf(Date);
    });

    it('should allow updating properties', () => {
      user.name = 'Updated Name';
      user.email = 'updated@example.com';

      expect(user.name).toBe('Updated Name');
      expect(user.email).toBe('updated@example.com');
    });
  });

  describe('Entity Validation', () => {
    it('should accept valid email formats', () => {
      const validEmails = [
        'user@example.com',
        'test.user@example.co.uk',
        'user+tag@example.org',
        'user123@subdomain.example.com',
        'user@example-domain.com',
      ];

      validEmails.forEach(email => {
        const user = new User();
        user.email = email;
        expect(user.email).toBe(email);
      });
    });

    it('should accept various name formats', () => {
      const validNames = [
        'John Doe',
        'José María',
        'O\'Connor-Smith',
        'Jean-Pierre',
        '李小明',
        'Александр',
      ];

      validNames.forEach(name => {
        const user = new User();
        user.name = name;
        expect(user.name).toBe(name);
      });
    });
  });

  describe('Entity Serialization', () => {
    it('should be serializable to JSON', () => {
      const user = new User();
      user.id = 1;
      user.name = 'Test User';
      user.email = 'test@example.com';
      user.createdAt = new Date('2024-01-15T10:30:00.000Z');

      const json = JSON.stringify(user);
      const parsed = JSON.parse(json);

      expect(parsed.id).toBe(1);
      expect(parsed.name).toBe('Test User');
      expect(parsed.email).toBe('test@example.com');
      expect(parsed.createdAt).toBe('2024-01-15T10:30:00.000Z');
    });

    it('should handle undefined values in serialization', () => {
      const user = new User();
      user.name = 'Test User';
      user.email = 'test@example.com';

      const json = JSON.stringify(user);
      const parsed = JSON.parse(json);

      expect(parsed.id).toBeUndefined();
      expect(parsed.name).toBe('Test User');
      expect(parsed.email).toBe('test@example.com');
      expect(parsed.createdAt).toBeUndefined();
    });
  });

  describe('Entity Comparison', () => {
    it('should be equal to another entity with same data', () => {
      const user1 = new User();
      user1.id = 1;
      user1.name = 'Test User';
      user1.email = 'test@example.com';
      user1.createdAt = new Date('2024-01-15T10:30:00.000Z');

      const user2 = new User();
      user2.id = 1;
      user2.name = 'Test User';
      user2.email = 'test@example.com';
      user2.createdAt = new Date('2024-01-15T10:30:00.000Z');

      expect(user1.id).toBe(user2.id);
      expect(user1.name).toBe(user2.name);
      expect(user1.email).toBe(user2.email);
      expect(user1.createdAt.getTime()).toBe(user2.createdAt.getTime());
    });

    it('should be different from entity with different data', () => {
      const user1 = new User();
      user1.id = 1;
      user1.name = 'User One';
      user1.email = 'user1@example.com';

      const user2 = new User();
      user2.id = 2;
      user2.name = 'User Two';
      user2.email = 'user2@example.com';

      expect(user1.id).not.toBe(user2.id);
      expect(user1.name).not.toBe(user2.name);
      expect(user1.email).not.toBe(user2.email);
    });
  });

  describe('Entity Edge Cases', () => {
    it('should handle empty string name', () => {
      const user = new User();
      user.name = '';
      user.email = 'test@example.com';

      expect(user.name).toBe('');
    });

    it('should handle empty string email', () => {
      const user = new User();
      user.name = 'Test User';
      user.email = '';

      expect(user.email).toBe('');
    });

    it('should handle very long names', () => {
      const longName = 'A'.repeat(1000);
      const user = new User();
      user.name = longName;
      user.email = 'test@example.com';

      expect(user.name).toBe(longName);
    });

    it('should handle very long emails', () => {
      const longEmail = 'a'.repeat(100) + '@example.com';
      const user = new User();
      user.name = 'Test User';
      user.email = longEmail;

      expect(user.email).toBe(longEmail);
    });

    it('should handle null values gracefully', () => {
      const user = new User();
      user.name = null as any;
      user.email = null as any;

      expect(user.name).toBeNull();
      expect(user.email).toBeNull();
    });

    it('should handle undefined values gracefully', () => {
      const user = new User();
      user.name = undefined as any;
      user.email = undefined as any;

      expect(user.name).toBeUndefined();
      expect(user.email).toBeUndefined();
    });
  });
});
